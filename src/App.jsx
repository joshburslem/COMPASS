import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

function App() {
  const [currentView, setCurrentView] = React.useState('executive');
  const [selectedYear, setSelectedYear] = React.useState(2024);
  const [scenarios, setScenarios] = React.useState([]);
  const [activeScenario, setActiveScenario] = React.useState('baseline');
  const [showScenarioModal, setShowScenarioModal] = React.useState(false);
  const [importedData, setImportedData] = React.useState(null);
  const [showDataImport, setShowDataImport] = React.useState(false);
  const [selectedOccupations, setSelectedOccupations] = React.useState(['All']);
  const [activeParameterTab, setActiveParameterTab] = React.useState('supply');
  const [selectedParameterYear, setSelectedParameterYear] = React.useState(2024);
  const [unsavedChanges, setUnsavedChanges] = React.useState(false);
  const [pendingChanges, setPendingChanges] = React.useState({}); // Track pending parameter changes
  const [livePreview, setLivePreview] = React.useState(false);
  const [livePreviewProjections, setLivePreviewProjections] = React.useState(null);

  // Enhanced data structure with all editable parameters
  const [workforceData, setWorkforceData] = React.useState(() => {
    const baselineParams = generateInitialParameters();
    return {
      occupations: ['Physicians', 'Nurse Practitioners', 'Registered Nurses', 'Licensed Practical Nurses', 'Medical Office Assistants'],
      populationSegments: {
        ageGroups: ['0-18', '19-64', '65-84', '85+'],
        genders: ['Male', 'Female'],
        healthStatus: ['Major Chronic', 'Minor Acute', 'Palliative', 'Healthy']
      },
      baselineParameters: baselineParams, // Immutable baseline - never modify this
      scenarios: {
        baseline: {
          name: 'Baseline',
          parameters: JSON.parse(JSON.stringify(baselineParams)) // Deep copy for safety
        }
      }
    };
  });

  // Executive View data - always uses baseline parameters (immutable)
  const [executiveData, setExecutiveData] = React.useState(() => ({
    projections: generateSampleProjections(workforceData.baselineParameters),
    parameters: workforceData.baselineParameters
  }));

  // Temporary parameters for editing in Analyst View - initialize with baseline copy
  const [editingParameters, setEditingParameters] = React.useState(() => 
    JSON.parse(JSON.stringify(workforceData.baselineParameters))
  );

  function generateInitialParameters() {
    const years = Array.from({length: 11}, (_, i) => 2024 + i);
    const occupations = ['Physicians', 'Nurse Practitioners', 'Registered Nurses', 'Licensed Practical Nurses', 'Medical Office Assistants'];
    const ageGroups = ['0-18', '19-64', '65-84', '85+'];

    const params = {
      // Supply Parameters
      supply: {},
      educationalInflow: {},
      internationalMigrants: {},
      domesticMigrants: {},
      reEntrants: {},
      retirementRate: {},
      attritionRate: {},

      // Demand Parameters
      populationGrowth: {},
      healthStatusChange: {},
      serviceUtilization: {}
    };

    years.forEach(year => {
      // Initialize supply parameters
      params.supply[year] = {};
      params.educationalInflow[year] = {};
      params.internationalMigrants[year] = {};
      params.domesticMigrants[year] = {};
      params.reEntrants[year] = {};
      params.retirementRate[year] = {};
      params.attritionRate[year] = {};

      // Initialize demand parameters
      params.populationGrowth[year] = {};
      params.healthStatusChange[year] = {};
      params.serviceUtilization[year] = {};

      occupations.forEach(occ => {
        params.supply[year][occ] = {
          'Physicians': 2500,
          'Nurse Practitioners': 800,
          'Registered Nurses': 4200,
          'Licensed Practical Nurses': 1800,
          'Medical Office Assistants': 3200
        }[occ] * (1 + (year - 2024) * 0.01);

        params.educationalInflow[year][occ] = {
          'Physicians': 100,
          'Nurse Practitioners': 50,
          'Registered Nurses': 200,
          'Licensed Practical Nurses': 150,
          'Medical Office Assistants': 100
        }[occ];

        params.internationalMigrants[year][occ] = {
          'Physicians': 25,
          'Nurse Practitioners': 10,
          'Registered Nurses': 40,
          'Licensed Practical Nurses': 20,
          'Medical Office Assistants': 15
        }[occ];

        params.domesticMigrants[year][occ] = {
          'Physicians': 15,
          'Nurse Practitioners': 8,
          'Registered Nurses': 30,
          'Licensed Practical Nurses': 15,
          'Medical Office Assistants': 10
        }[occ];

        params.reEntrants[year][occ] = {
          'Physicians': 10,
          'Nurse Practitioners': 5,
          'Registered Nurses': 25,
          'Licensed Practical Nurses': 12,
          'Medical Office Assistants': 20
        }[occ];

        params.retirementRate[year][occ] = {
          'Physicians': 0.06,
          'Nurse Practitioners': 0.05,
          'Registered Nurses': 0.04,
          'Licensed Practical Nurses': 0.04,
          'Medical Office Assistants': 0.03
        }[occ];

        params.attritionRate[year][occ] = 0.15;
      });

      // Population growth by age group
      ageGroups.forEach(ageGroup => {
        params.populationGrowth[year][ageGroup] = {
          '0-18': 0.01,
          '19-64': 0.015,
          '65-84': 0.025,
          '85+': 0.03
        }[ageGroup];
      });

      // Health status changes
      params.healthStatusChange[year] = {
        'Major Chronic': 0.02,
        'Minor Acute': -0.01,
        'Palliative': 0.005,
        'Healthy': -0.015
      };

      // Service utilization changes
      params.serviceUtilization[year] = {
        'Primary Care Visits': 0.02,
        'Preventive Care': 0.03,
        'Chronic Disease Management': 0.04,
        'Mental Health Services': 0.05
      };
    });

    return params;
  }

  function generateSampleProjections(parameters = null) {
    const years = Array.from({length: 11}, (_, i) => 2024 + i);
    const occupations = ['Physicians', 'Nurse Practitioners', 'Registered Nurses', 'Licensed Practical Nurses', 'Medical Office Assistants'];

    return years.reduce((acc, year) => {
      acc[year] = {};
      occupations.forEach(occ => {
        let baseSupply = parameters ? parameters.supply[year][occ] : {
          'Physicians': 2500,
          'Nurse Practitioners': 800,
          'Registered Nurses': 4200,
          'Licensed Practical Nurses': 1800,
          'Medical Office Assistants': 3200
        }[occ];

        if (parameters) {
          // Calculate supply with all inflows and outflows
          const inflows = parameters.educationalInflow[year][occ] + 
                         parameters.internationalMigrants[year][occ] + 
                         parameters.domesticMigrants[year][occ] + 
                         parameters.reEntrants[year][occ];
          const outflows = baseSupply * (parameters.retirementRate[year][occ] + parameters.attritionRate[year][occ]);
          baseSupply = baseSupply + inflows - outflows;
        }

        const baseDemand = baseSupply * 1.1; // 10% shortage baseline
        const yearMultiplier = 1 + (year - 2024) * 0.02; // 2% annual growth

        acc[year][occ] = {
          supply: Math.round(parameters ? baseSupply : baseSupply * yearMultiplier * (0.95 + Math.random() * 0.1)),
          demand: Math.round(baseDemand * yearMultiplier),
          gap: 0
        };
        acc[year][occ].gap = acc[year][occ].demand - acc[year][occ].supply;
      });
      return acc;
    }, {});
  }

  const applyParameterChanges = React.useCallback(() => {
    // Generate new projections based on current editing parameters
    const newProjections = generateSampleProjections(editingParameters);

    // Only update existing scenarios - never modify baseline or create new ones automatically
    if (activeScenario !== 'baseline') {
      const updatedScenarios = scenarios.map(scenario => 
        scenario.id === activeScenario 
          ? { ...scenario, parameters: JSON.parse(JSON.stringify(editingParameters)), projections: newProjections }
          : scenario
      );
      setScenarios(updatedScenarios);

      setUnsavedChanges(false);
      setPendingChanges({});

      console.log('Applied changes to scenario:', activeScenario);
    } else {
      // For baseline, we don't apply changes - user must create a new scenario
      console.log('Cannot apply changes to baseline - use scenario management to save as new scenario');
    }
    setLivePreview(false);
    setLivePreviewProjections(null);
  }, [editingParameters, activeScenario, scenarios]);

  const generateLivePreview = () => {
    const newProjections = generateSampleProjections(editingParameters);
    setLivePreviewProjections(newProjections);
    setLivePreview(true);
  };

  const clearLivePreview = () => {
    setLivePreviewProjections(null);
    setLivePreview(false);
  };

  const resetParameters = () => {
    if (activeScenario === 'baseline') {
      // Always use the immutable baseline parameters
      setEditingParameters(JSON.parse(JSON.stringify(workforceData.baselineParameters)));
    } else {
      const scenario = scenarios.find(s => s.id === activeScenario);
      if (scenario) {
        // Use the scenario's saved parameters
        setEditingParameters(JSON.parse(JSON.stringify(scenario.parameters)));
      }
    }
    setUnsavedChanges(false);
    setPendingChanges({});
    clearLivePreview();
  };

  const resetToBaseline = () => {
    // Always use the immutable baseline parameters
    setEditingParameters(JSON.parse(JSON.stringify(workforceData.baselineParameters)));
    setActiveScenario('baseline');
    setUnsavedChanges(false);
    setPendingChanges({});
    clearLivePreview();
  };

  const updateParameter = (paramType, year, occupation, value) => {
    // Create a completely new parameter object to avoid any reference issues
    const newParams = JSON.parse(JSON.stringify(editingParameters));
    if (!newParams[paramType][year]) {
      newParams[paramType][year] = {};
    }
    newParams[paramType][year][occupation] = parseFloat(value) || 0;
    setEditingParameters(newParams);
    setUnsavedChanges(true);

    // Track the specific parameter change
    setPendingChanges(prev => ({
      ...prev,
      [`${paramType}|${year}|${occupation}`]: true
    }));
  };

  const createNewScenario = (scenarioData) => {
    console.log('Creating scenario with data:', scenarioData);
    console.log('Current editing parameters:', editingParameters);

    const scenarioProjections = generateSampleProjections(editingParameters);

    const newScenario = {
      id: Date.now().toString(),
      name: scenarioData.name,
      description: scenarioData.description,
      parameters: JSON.parse(JSON.stringify(editingParameters)), // Deep copy
      projections: scenarioProjections,
      createdAt: new Date().toISOString()
    };

    console.log('New scenario created:', newScenario);

    const updatedScenarios = [...scenarios, newScenario];
    setScenarios(updatedScenarios);
    setActiveScenario(newScenario.id);
    setShowScenarioModal(false);
    setUnsavedChanges(false);
    clearLivePreview();

    console.log('Updated scenarios list:', updatedScenarios);
  };

  const getCurrentScenarioProjections = () => {
    if (currentView === 'executive') {
      // Executive View ALWAYS shows baseline projections - never affected by analyst changes
      return executiveData.projections;
    }

    // Analyst View - show live preview if available, otherwise show saved projections
    if (livePreviewProjections) {
      return livePreviewProjections;
    }

    if (activeScenario === 'baseline') {
      // Always show baseline projections until changes are applied
      return executiveData.projections;
    } else {
      const scenario = scenarios.find(s => s.id === activeScenario);
      return scenario?.projections || executiveData.projections;
    }
  };

  const toggleOccupation = (occupation) => {
    if (occupation === 'All') {
      setSelectedOccupations(['All']);
    } else {
      if (selectedOccupations.includes('All')) {
        setSelectedOccupations([occupation]);
      } else if (selectedOccupations.includes(occupation)) {
        const filtered = selectedOccupations.filter(o => o !== occupation);
        setSelectedOccupations(filtered.length === 0 ? ['All'] : filtered);
      } else {
        setSelectedOccupations([...selectedOccupations, occupation]);
      }
    }
  };

  const getFilteredOccupations = () => {
    if (selectedOccupations.includes('All')) {
      return workforceData.occupations;
    }
    return selectedOccupations;
  };

  const ExecutiveView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Executive Dashboard</h2>
        <p className="text-sm text-gray-600 mb-4">Viewing baseline projections</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800">Current Year Gap</h3>
            <p className="text-3xl font-bold text-blue-600">
              {Object.values(executiveData.projections[selectedYear] || {})
                .reduce((sum, occ) => sum + Math.max(0, occ.gap), 0)}
            </p>
            <p className="text-sm text-blue-600">FTE positions ({selectedYear})</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800">2034 Projected Gap</h3>
            <p className="text-3xl font-bold text-red-600">
              {Object.values(executiveData.projections[2034] || {})
                .reduce((sum, occ) => sum + Math.max(0, occ.gap), 0)}
            </p>
            <p className="text-sm text-red-600">FTE positions (2034)</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800">Population Growth</h3>
            <p className="text-3xl font-bold text-green-600">+12.3%</p>
            <p className="text-sm text-green-600">Expected by 2034</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800">Chronic Conditions</h3>
            <p className="text-3xl font-bold text-orange-600">23% → 28%</p>
            <p className="text-sm text-orange-600">Projected increase</p>
          </div>
        </div>

        {/* Occupation Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Select Occupations to View</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleOccupation('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedOccupations.includes('All')
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Occupations
            </button>
            {workforceData.occupations.map(occ => (
              <button
                key={occ}
                onClick={() => toggleOccupation(occ)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedOccupations.includes(occ) && !selectedOccupations.includes('All')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Line Chart */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Projected Workforce Gap Trends (2024-2034) - Baseline</h3>
          <WorkforceGapTrendChart 
            data={executiveData.projections} 
            selectedOccupations={getFilteredOccupations()}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Year-over-Year Gap Analysis</h3>
          <YearOverYearAnalysis 
            data={executiveData.projections}
            selectedOccupations={getFilteredOccupations()}
            currentYear={selectedYear}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Supply vs Demand by Occupation ({selectedYear})</h3>
          <SupplyDemandComparison 
            data={executiveData.projections[selectedYear]}
            selectedOccupations={getFilteredOccupations()}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold mb-4">Critical Workforce Insights</h3>
        <WorkforceInsights 
          data={executiveData.projections}
          selectedOccupations={getFilteredOccupations()}
        />
      </div>
    </div>
  );

  const AnalystView = () => (
    <div className="space-y-6">
      {/* Main Dashboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analyst Dashboard</h2>
            <p className="text-sm text-gray-600">
              Current: {activeScenario === 'baseline' ? 'Baseline' : scenarios.find(s => s.id === activeScenario)?.name || 'Unknown Scenario'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {unsavedChanges && (
              <>
                <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
                {activeScenario === 'baseline' ? (
                  <span className="text-sm text-gray-600 italic">
                    Go to Scenario Management tab to save as new scenario
                  </span>
                ) : (
                  <button 
                    onClick={applyParameterChanges}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                  >
                    Apply Changes
                  </button>
                )}
                <button 
                  onClick={resetParameters}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm"
                >
                  Reset
                </button>
              </>
            )}
              {/* Apply Changes Button for Live Preview */}
            {activeScenario !== 'baseline' && (
              <button
                onClick={generateLivePreview}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
              >
                {livePreview ? 'Update Preview' : 'Apply Changes for Preview'}
              </button>
            )}
            <button 
              onClick={resetToBaseline}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
            >
              Load Baseline
            </button>
          </div>
        </div>

        {/* Year Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Parameter Configuration</h3>
              <p className="text-sm text-gray-600">Edit parameters for the selected year</p>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">Editing Year:</label>
              <select 
                value={selectedParameterYear} 
                onChange={(e) => setSelectedParameterYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({length: 11}, (_, i) => 2024 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Parameter Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'supply', label: 'Supply Parameters' },
              { id: 'inflows', label: 'Workforce Inflows' },
              { id: 'outflows', label: 'Retirement & Attrition' },
              { id: 'demand', label: 'Demand Drivers' },
              { id: 'scenarios', label: 'Scenario Management' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveParameterTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeParameterTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Parameter Content */}
        <div className="mb-6">
          {activeParameterTab === 'supply' && (
            <ParameterGridWithBaseline 
              title="Current Supply (FTE)"
              parameterType="supply"
              parameters={editingParameters.supply}
              baselineParameters={workforceData.baselineParameters.supply}
              onUpdate={updateParameter}
              occupations={workforceData.occupations}
            />
          )}

          {activeParameterTab === 'inflows' && (
            <div className="space-y-6">
              <ParameterGridWithBaseline 
                title="Educational Inflow (Annual Graduates)"
                parameterType="educationalInflow"
                parameters={editingParameters.educationalInflow}
                baselineParameters={workforceData.baselineParameters.educationalInflow}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
              />
              <ParameterGridWithBaseline 
                title="International Migrants (Annual)"
                parameterType="internationalMigrants"
                parameters={editingParameters.internationalMigrants}
                baselineParameters={workforceData.baselineParameters.internationalMigrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
              />
              <ParameterGridWithBaseline 
                title="Domestic Migrants (Annual)"
                parameterType="domesticMigrants"
                parameters={editingParameters.domesticMigrants}
                baselineParameters={workforceData.baselineParameters.domesticMigrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
              />
              <ParameterGridWithBaseline 
                title="Re-Entrants (Annual)"
                parameterType="reEntrants"
                parameters={editingParameters.reEntrants}
                baselineParameters={workforceData.baselineParameters.reEntrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
              />
            </div>
          )}

          {activeParameterTab === 'outflows' && (
            <div className="space-y-6">
              <ParameterGridWithBaseline 
                title="Retirement Rate (%)"
                parameterType="retirementRate"
                parameters={editingParameters.retirementRate}
                baselineParameters={workforceData.baselineParameters.retirementRate}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                isPercentage={true}
              />
              <ParameterGridWithBaseline 
                title="Attrition Rate (%)"
                parameterType="attritionRate"
                parameters={editingParameters.attritionRate}
                baselineParameters={workforceData.baselineParameters.attritionRate}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                isPercentage={true}
              />
            </div>
          )}

          {activeParameterTab === 'demand' && (
            <div className="space-y-6">
              <DemandParameterGrid 
                title="Population Growth Rate (% per year)"
                parameterType="populationGrowth"
                parameters={editingParameters.populationGrowth}
                baselineParameters={workforceData.baselineParameters.populationGrowth}
                onUpdate={updateParameter}
                categories={['0-18', '19-64', '65-84', '85+']}
              />
              <DemandParameterGrid 
                title="Health Status Change (% per year)"
                parameterType="healthStatusChange"
                parameters={editingParameters.healthStatusChange}
                baselineParameters={workforceData.baselineParameters.healthStatusChange}
                onUpdate={updateParameter}
                categories={['Major Chronic', 'Minor Acute', 'Palliative', 'Healthy']}
              />
              <DemandParameterGrid 
                title="Service Utilization Change (% per year)"
                parameterType="serviceUtilization"
                parameters={editingParameters.serviceUtilization}
                baselineParameters={workforceData.baselineParameters.serviceUtilization}
                onUpdate={updateParameter}
                categories={['Primary Care Visits', 'Preventive Care', 'Chronic Disease Management', 'Mental Health Services']}
              />
            </div>
          )}

          {activeParameterTab === 'scenarios' && (
            <ScenarioManagement
              scenarios={scenarios}
              activeScenario={activeScenario}
              onCreateScenario={() => setShowScenarioModal(true)}
              onSelectScenario={(scenarioId) => {
                console.log('Loading scenario:', scenarioId);
                console.log('Available scenarios:', scenarios);

                clearLivePreview(); // Clear any live preview when switching scenarios

                if (scenarioId === 'baseline') {
                  console.log('Loading baseline parameters');
                  // Always use the immutable baseline parameters - create a fresh copy
                  setEditingParameters(JSON.parse(JSON.stringify(workforceData.baselineParameters)));
                  setActiveScenario('baseline');
                  setUnsavedChanges(false);
                  setPendingChanges({});
                } else {
                  const scenario = scenarios.find(s => s.id === scenarioId);
                  console.log('Found scenario:', scenario);

                  if (scenario && scenario.parameters) {
                    console.log('Loading scenario parameters:', scenario.parameters);
                    // Create a fresh copy of scenario parameters to avoid reference issues
                    setEditingParameters(JSON.parse(JSON.stringify(scenario.parameters)));
                    setActiveScenario(scenarioId);
                    setUnsavedChanges(false);
                    setPendingChanges({});
                  } else {
                    console.error('Scenario not found or missing parameters:', scenarioId);
                    // Fallback to baseline if scenario is corrupted
                    setEditingParameters(JSON.parse(JSON.stringify(workforceData.baselineParameters)));
                    setActiveScenario('baseline');
                    setUnsavedChanges(false);
                    setPendingChanges({});
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">
            Projected Workforce Gap Trends 
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({activeScenario === 'baseline' ? 'Baseline' : scenarios.find(s => s.id === activeScenario)?.name || 'Current Scenario'})
            </span>
          </h3>
          <WorkforceGapTrendChart 
            data={getCurrentScenarioProjections()} 
            selectedOccupations={workforceData.occupations}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Supply vs Demand Analysis</h3>
          <DetailedSupplyDemandChart data={getCurrentScenarioProjections()} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Parameter Impact Analysis</h3>
          <ParameterImpactChart parameters={
            activeScenario === 'baseline' 
              ? workforceData.baselineParameters 
              : scenarios.find(s => s.id === activeScenario)?.parameters || workforceData.baselineParameters
          } />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Population Health Segments</h3>
          <PopulationSegmentAnalysis />
        </div>
      </div>
    </div>
  );

  const ParameterGridWithBaseline = ({ title, parameterType, parameters, baselineParameters, onUpdate, occupations, isPercentage = false }) => {
    return (
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="bg-white border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {occupations.map(occ => {
              const baseline = baselineParameters[selectedParameterYear][occ];
              const current = parameters[selectedParameterYear][occ];
              const change = ((current - baseline) / baseline * 100).toFixed(1);

              return (
                <div key={occ} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{occ}</label>
                  <div className="space-y-1">
                    <input
                      type="number"
                      step={isPercentage ? "0.01" : "1"}
                      value={current}
                      onChange={(e) => onUpdate(parameterType, selectedParameterYear, occ, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">
                        Baseline: {isPercentage ? `${(baseline * 100).toFixed(1)}%` : baseline}
                      </span>
                      <span className={`font-medium ${Math.abs(change) < 0.01 ? 'text-gray-500' : change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(change) < 0.01 ? '=' : change > 0 ? '+' : ''}{change}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const DemandParameterGrid = ({ title, parameterType, parameters, baselineParameters, onUpdate, categories }) => {
    return (
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="bg-white border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(cat => {
              const baseline = baselineParameters[selectedParameterYear][cat];
              const current = parameters[selectedParameterYear][cat];
              const change = ((current - baseline) / baseline * 1baseline * 100).toFixed(1)}%`
                      </span>
                      <span className={`font-medium ${Math.abs(change) < 0.01 ? 'text-gray-500' : change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(change) < 0.01 ? '=' : change > 0 ? '+' : ''}{change}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ScenarioManagement = ({ scenarios, activeScenario, onCreateScenario, onSelectScenario }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Active Scenario</label>
          <select 
            value={activeScenario}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="baseline">Baseline</option>
            {scenarios.map(scenario => (
              
                {scenario.name}
              
            ))}
          </select>
        </div>
        
            onClick={onCreateScenario}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            {activeScenario === 'baseline' && unsavedChanges ? 'Save Current Changes as New Scenario' : 'Create New Scenario'}
          
          
            Export Scenario
          
        
      

      {activeScenario === 'baseline' && unsavedChanges && (
        
          
            
              Click "Save Current Changes as New Scenario" above to create a new scenario with your current parameter adjustments.
            
          
        
      

      {scenarios.length > 0 && (
        
          
            Saved Scenarios
          
          
            {scenarios.map(scenario => (
              
                
                  
                    {scenario.name}
                    {scenario.description || 'No description'}
                  
                  
                    
                      Load
                      Delete
                    
                  
                
              
            ))}
          
        
      
    
  );

  const ParameterImpactChart = ({ parameters }) => {
    // Calculate impact of parameter changes
    const impactData = workforceData.occupations.map(occ => ({
      occupation: occ,
      educationalInflow: parameters.educationalInflow[2024][occ] * 0.8,
      internationalMigrants: parameters.internationalMigrants[2024][occ] * 0.9,
      domesticMigrants: parameters.domesticMigrants[2024][occ] * 0.85,
      reEntrants: parameters.reEntrants[2024][occ] * 0.7,
      retirementImpact: -parameters.retirementRate[2024][occ] * parameters.supply[2024][occ],
      attritionImpact: -parameters.attritionRate[2024][occ] * parameters.supply[2024][occ] * 0.5
    }));

    return (
      
        
          
            
            
            
            
            
            
            
            
          
        
      
    );
  };

  const WorkforceGapTrendChart = ({ data, selectedOccupations }) => {
    // Transform data for Recharts
    const years = Object.keys(data).sort();
    const chartData = years.map(year => {
      const yearData = { year };
      selectedOccupations.forEach(occ => {
        yearData[occ] = data[year][occ]?.gap || 0;
      });
      return yearData;
    });

    const colors = {
      'Physicians': '#3B82F6',
      'Nurse Practitioners': '#10B981',
      'Registered Nurses': '#F59E0B',
      'Licensed Practical Nurses': '#EF4444',
      'Medical Office Assistants': '#8B5CF6'
    };

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          

            {`Year: ${label}`}
            {payload.map((entry, index) => (
              {`${entry.name}: ${entry.value.toLocaleString()} FTE`}
            ))}
          

        );
      }
      return null;
    };

    return (
      
        
          
            
            
              
                
              
              
                
              
            
            
              
              
                
                  
                  
                
              
            
              
                
                
                
                
                
                
                
                
              
            
          
        
      
    );
  };

  const YearOverYearAnalysis = ({ data, selectedOccupations, currentYear }) => {
    const years = [currentYear - 1, currentYear, currentYear + 1].filter(y => data[y]);

    return (
      

            {occ}
            
              
                Previous:
                
              
              
                Current:
                
              
              
                Next:
                
              
            
            
              {changeToNext > 0 ? '↑' : '↓'} {Math.abs(changeToNext)} FTE change expected
            
          
        
      
    );
  };

  const SupplyDemandComparison = ({ data, selectedOccupations }) => {
    if (!data) return No data available;

    return (
      

            {occ}
            
              Gap: {values.gap > 0 ? '+' : ''}{values.gap} FTE
            
            
              
                
              
              
                Supply: {values.supply}
                Demand: {values.demand}
              
            
          
        
      
    );
  };

  const WorkforceInsights = ({ data, selectedOccupations }) => {
    const calculateInsights = () => {
      const insights = [];
      const years = Object.keys(data).sort();

      selectedOccupations.forEach(occ => {
        const gaps = years.map(year => data[year][occ]?.gap || 0);
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const trend = gaps[gaps.length - 1] - gaps[0];

        if (avgGap > 200) {
          insights.push({
            type: 'critical',
            occupation: occ,
            message: `${occ} faces critical shortage with average gap of ${Math.round(avgGap)} FTE`
          });
        }

        if (trend > 100) {
          insights.push({
            type: 'warning',
            occupation: occ,
            message: `${occ} gap increasing rapidly - ${Math.round(trend)} FTE growth over period`
          });
        }
      });

      return insights;
    };

    const insights = calculateInsights();

    return (
      

            {insight.message}
          
        ))}

        {insights.length === 0 && (
          No critical insights for selected occupations.
        )}
      
    );
  };

  const DetailedSupplyDemandChart = ({ data }) => {
    const years = Object.keys(data).sort();
    const chartData = years.map(year => {
      const yearData = { year };
      const totalSupply = Object.values(data[year]).reduce((sum, occ) => sum + occ.supply, 0);
      const totalDemand = Object.values(data[year]).reduce((sum, occ) => sum + occ.demand, 0);
      yearData.supply = totalSupply;
      yearData.demand = totalDemand;
      return yearData;
    });

    return (
      
        
          
            
            
            
            
          
        
      
    );
  };

  const PopulationSegmentAnalysis = () => (
    

        {workforceData.populationSegments.healthStatus.map(status => (
          
            
              {Math.floor(Math.random() * 30 + 10)}%
            
            {status}
          
        ))}
      
      
        
          Population health segmentation drives service demand projections. 
          Chronic conditions are expected to increase by 22% over the forecast period.
        
      
    
  );

  const DataImportModal = () => (
    

        
          Import Data
          
            
              Data Type
              
                Population Data
                Workforce Supply Data
                Service Utilization Data
                Health Status Data
              
            
            
              File Upload
              
            
            
              
                Cancel
              
              Import
            
          
        
      
    
  );

  const ScenarioModal = () => {
    const [scenarioName, setScenarioName] = React.useState('');
    const [scenarioDescription, setScenarioDescription] = React.useState('');

    const handleCreate = () => {
      if (scenarioName.trim()) {
        createNewScenario({ 
          name: scenarioName.trim(), 
          description: scenarioDescription.trim() 
        });
        setScenarioName('');
        setScenarioDescription('');
      }
    };

    const handleCancel = () => {
      setShowScenarioModal(false);
      setScenarioName('');
      setScenarioDescription('');
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey && scenarioName.trim()) {
        e.preventDefault();
        handleCreate();
      }
    };

    return (
      

        
          Create New Scenario
          
            
              Scenario Name
              
              
                {scenarioName.length}/50 characters
              
            
            
              Description (Optional)
              
              
                {scenarioDescription.length}/200 characters
              
            
            
              
                Cancel
              
              
                Create Scenario
              
            
          
        
      
    );
  };

  return (
    

      
        
          
            
              Nova Scotia Primary Care Workforce Planning
              Multi-Professional Needs-Based Analytics Dashboard
            
            
              
                {Array.from({length: 11}, (_, i) => 2024 + i).map(year => (
                  {year}
                ))}
              
              
                Import Data
              
            
          
        
      

      
        
          
            
              Executive View
            
            
              Analyst View
            
          
        
      

      
        {currentView === 'executive' ?  : }
      

      
        
      
      
        
      
    
  );
}

export default App;