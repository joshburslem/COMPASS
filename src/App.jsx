import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

// Move components outside App to prevent recreation on each render
const ParameterGridWithBaseline = React.memo(({ title, parameterType, parameters, baselineParameters, onUpdate, occupations, isPercentage = false }) => {
  const years = Object.keys(parameters).sort();
  const [expandedYears, setExpandedYears] = React.useState(new Set(['2024']));

  const toggleYear = React.useCallback((year) => {
    setExpandedYears(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(year)) {
        newExpanded.delete(year);
      } else {
        newExpanded.add(year);
      }
      return newExpanded;
    });
  }, []);

  const handleInputChange = React.useCallback((year, occ, value) => {
    onUpdate(parameterType, year, occ, value);
  }, [onUpdate, parameterType]);

  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="space-y-2">
        {years.map(year => (
          <div key={`${parameterType}-${year}`} className="border rounded-lg">
            <button
              onClick={() => toggleYear(year)}
              className="w-full px-4 py-2 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium">{year}</span>
              <svg 
                className={`w-5 h-5 transform transition-transform ${expandedYears.has(year) ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedYears.has(year) && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {occupations.map(occ => {
                    const baseline = baselineParameters[year][occ];
                    const current = parameters[year][occ];
                    const change = ((current - baseline) / baseline * 100).toFixed(1);

                    return (
                      <div key={`${parameterType}-${year}-${occ}`} className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">{occ}</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step={isPercentage ? "0.01" : "1"}
                            value={current}
                            onChange={(e) => handleInputChange(year, occ, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className={`text-xs ${Math.abs(change) < 0.01 ? 'text-gray-500' : change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {Math.abs(change) < 0.01 ? '=' : change > 0 ? '+' : ''}{change}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Baseline: {isPercentage ? `${(baseline * 100).toFixed(1)}%` : baseline}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

ParameterGridWithBaseline.displayName = 'ParameterGridWithBaseline';

const DemandParameterGrid = React.memo(({ title, parameterType, parameters, baselineParameters, onUpdate, categories }) => {
  const years = Object.keys(parameters).sort();
  const [expandedYears, setExpandedYears] = React.useState(new Set(['2024']));

  const toggleYear = React.useCallback((year) => {
    setExpandedYears(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(year)) {
        newExpanded.delete(year);
      } else {
        newExpanded.add(year);
      }
      return newExpanded;
    });
  }, []);

  const handleInputChange = React.useCallback((year, cat, value) => {
    onUpdate(parameterType, year, cat, value);
  }, [onUpdate, parameterType]);

  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="space-y-2">
        {years.map(year => (
          <div key={`${parameterType}-${year}`} className="border rounded-lg">
            <button
              onClick={() => toggleYear(year)}
              className="w-full px-4 py-2 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium">{year}</span>
              <svg 
                className={`w-5 h-5 transform transition-transform ${expandedYears.has(year) ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {expandedYears.has(year) && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(cat => {
                    const baseline = baselineParameters[year][cat];
                    const current = parameters[year][cat];

                    return (
                      <div key={`${parameterType}-${year}-${cat}`} className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">{cat}</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.001"
                            value={current}
                            onChange={(e) => handleInputChange(year, cat, e.target.value)}
                            className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Baseline: {(baseline * 100).toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

DemandParameterGrid.displayName = 'DemandParameterGrid';

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
            <option key={scenario.id} value={scenario.id}>{scenario.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-end space-x-2">
        <button 
          onClick={onCreateScenario}
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
        >
          Create New Scenario
        </button>
        <button className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700">
          Export Scenario
        </button>
      </div>
    </div>

    {scenarios.length > 0 && (
      <div className="mt-6">
        <h5 className="font-medium text-gray-800 mb-3">Saved Scenarios</h5>
        <div className="space-y-2">
          {scenarios.map(scenario => (
            <div key={scenario.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{scenario.name}</p>
                <p className="text-sm text-gray-600">{scenario.description || 'No description'}</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => onSelectScenario(scenario.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Load
                </button>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

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
  const [unsavedChanges, setUnsavedChanges] = React.useState(false);

  // Enhanced data structure with all editable parameters
  const [workforceData, setWorkforceData] = React.useState({
    occupations: ['Physicians', 'Nurse Practitioners', 'Registered Nurses', 'Licensed Practical Nurses', 'Medical Office Assistants'],
    populationSegments: {
      ageGroups: ['0-18', '19-64', '65-84', '85+'],
      genders: ['Male', 'Female'],
      healthStatus: ['Major Chronic', 'Minor Acute', 'Palliative', 'Healthy']
    },
    projections: generateSampleProjections(),
    parameters: generateInitialParameters(),
    baselineParameters: generateInitialParameters(), // Store baseline for comparison
    scenarios: {
      baseline: {
        name: 'Baseline',
        parameters: generateInitialParameters()
      }
    }
  });

  // Separate parameters for Executive View (read-only baseline)
  const [executiveData, setExecutiveData] = React.useState({
    projections: workforceData.projections,
    parameters: workforceData.baselineParameters
  });

  // Use useReducer for more stable parameter updates
  const [editingParameters, dispatch] = React.useReducer(
    (state, action) => {
      switch (action.type) {
        case 'UPDATE_PARAMETER':
          const { paramType, year, occupation, value } = action.payload;
          return {
            ...state,
            [paramType]: {
              ...state[paramType],
              [year]: {
                ...state[paramType][year],
                [occupation]: parseFloat(value) || 0
              }
            }
          };
        case 'RESET_PARAMETERS':
          return action.payload;
        case 'LOAD_SCENARIO':
          return action.payload;
        default:
          return state;
      }
    },
    workforceData.parameters
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

  const applyParameterChanges = () => {
    const newProjections = generateSampleProjections(editingParameters);
    setWorkforceData({
      ...workforceData,
      parameters: editingParameters,
      projections: newProjections
    });
    setUnsavedChanges(false);

    // Note: Executive view remains unchanged
  };

  const resetParameters = React.useCallback(() => {
    dispatch({ type: 'RESET_PARAMETERS', payload: workforceData.parameters });
    setUnsavedChanges(false);
  }, [workforceData.parameters]);

  const updateParameter = React.useCallback((paramType, year, occupation, value) => {
    dispatch({
      type: 'UPDATE_PARAMETER',
      payload: { paramType, year, occupation, value }
    });
    setUnsavedChanges(true);
  }, []);

  const createNewScenario = (scenarioData) => {
    const newScenario = {
      id: Date.now().toString(),
      name: scenarioData.name,
      parameters: { ...editingParameters },
      ...scenarioData
    };
    setScenarios([...scenarios, newScenario]);
    setShowScenarioModal(false);
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
          <h3 className="text-xl font-semibold mb-4">Projected Workforce Gap Trends (2024-2034)</h3>
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
          <h2 className="text-2xl font-bold text-gray-800">Analyst Dashboard</h2>
          {unsavedChanges && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-orange-600 font-medium">Unsaved changes</span>
              <button 
                onClick={applyParameterChanges}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
              >
                Apply Changes
              </button>
              <button 
                onClick={resetParameters}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 text-sm"
              >
                Reset
              </button>
            </div>
          )}
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
                const scenario = scenarios.find(s => s.id === scenarioId);
                if (scenario) {
                  dispatch({ type: 'LOAD_SCENARIO', payload: scenario.parameters });
                  setActiveScenario(scenarioId);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Projected Workforce Gap Trends</h3>
          <WorkforceGapTrendChart 
            data={workforceData.projections} 
            selectedOccupations={workforceData.occupations}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Supply vs Demand Analysis</h3>
          <DetailedSupplyDemandChart data={workforceData.projections} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Parameter Impact Analysis</h3>
          <ParameterImpactChart parameters={editingParameters} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Population Health Segments</h3>
          <PopulationSegmentAnalysis />
        </div>
      </div>
    </div>
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
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={impactData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="occupation" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="educationalInflow" stackId="positive" fill="#10B981" name="Education" />
            <Bar dataKey="internationalMigrants" stackId="positive" fill="#3B82F6" name="Int'l Migration" />
            <Bar dataKey="domesticMigrants" stackId="positive" fill="#6366F1" name="Dom. Migration" />
            <Bar dataKey="reEntrants" stackId="positive" fill="#8B5CF6" name="Re-Entrants" />
            <Bar dataKey="retirementImpact" stackId="negative" fill="#EF4444" name="Retirement" />
            <Bar dataKey="attritionImpact" stackId="negative" fill="#F59E0B" name="Attrition" />
          </BarChart>
        </ResponsiveContainer>
      </div>
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
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
            <p className="font-semibold text-gray-800 mb-2">{`Year: ${label}`}</p>
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value.toLocaleString()} FTE`}
              </p>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={chartData} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              {selectedOccupations.map(occ => (
                <linearGradient key={`gradient-${occ}`} id={`gradient-${occ}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[occ] || '#6B7280'} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[occ] || '#6B7280'} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="year" 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis 
              stroke="#6B7280"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              label={{ value: 'Workforce Gap (FTE)', angle: -90, position: 'insideLeft', style: { fill: '#4B5563' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="line"
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {selectedOccupations.map(occ => (
              <Line
                key={occ}
                type="monotone"
                dataKey={occ}
                stroke={colors[occ] || '#6B7280'}
                strokeWidth={3}
                fill={`url(#gradient-${occ})`}
                dot={{ fill: colors[occ] || '#6B7280', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const YearOverYearAnalysis = ({ data, selectedOccupations, currentYear }) => {
    const years = [currentYear - 1, currentYear, currentYear + 1].filter(y => data[y]);

    return (
      <div className="space-y-4">
        {selectedOccupations.map(occ => {
          const prevGap = data[currentYear - 1]?.[occ]?.gap || 0;
          const currGap = data[currentYear]?.[occ]?.gap || 0;
          const nextGap = data[currentYear + 1]?.[occ]?.gap || 0;

          const changeFromPrev = currGap - prevGap;
          const changeToNext = nextGap - currGap;

          return (
            <div key={occ} className="border-b pb-3">
              <h4 className="font-medium text-gray-800">{occ}</h4>
              <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-gray-600">Previous:</span>
                  <span className="ml-2 font-semibold">{prevGap}</span>
                </div>
                <div>
                  <span className="text-gray-600">Current:</span>
                  <span className="ml-2 font-semibold text-blue-600">{currGap}</span>
                </div>
                <div>
                  <span className="text-gray-600">Next:</span>
                  <span className="ml-2 font-semibold">{nextGap}</span>
                </div>
              </div>
              <div className="flex items-center mt-2 text-xs">
                <span className={`flex items-center ${changeToNext > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {changeToNext > 0 ? '↑' : '↓'} {Math.abs(changeToNext)} FTE change expected
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const SupplyDemandComparison = ({ data, selectedOccupations }) => {
    if (!data) return <div>No data available</div>;

    return (
      <div className="space-y-4">
        {selectedOccupations.map(occ => {
          const values = data[occ];
          if (!values) return null;

          const fillPercentage = Math.min((values.supply / values.demand) * 100, 100);

          return (
            <div key={occ} className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800">{occ}</h4>
                <span className={`text-sm font-semibold ${values.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  Gap: {values.gap > 0 ? '+' : ''}{values.gap} FTE
                </span>
              </div>
              <div className="relative">
                <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${fillPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-600">
                  <span>Supply: {values.supply}</span>
                  <span>Demand: {values.demand}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg flex items-start space-x-3 ${
              insight.type === 'critical' ? 'bg-red-50' : 'bg-yellow-50'
            }`}
          >
            <div className={`flex-shrink-0 ${
              insight.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                insight.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
              }`}>
                {insight.message}
              </p>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <p className="text-gray-600">No critical insights for selected occupations.</p>
        )}
      </div>
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
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="demand" stackId="1" stroke="#EF4444" fill="#FEE2E2" name="Total Demand" />
            <Area type="monotone" dataKey="supply" stackId="2" stroke="#3B82F6" fill="#DBEAFE" name="Total Supply" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const PopulationSegmentAnalysis = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {workforceData.populationSegments.healthStatus.map(status => (
          <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(Math.random() * 30 + 10)}%
            </div>
            <div className="text-sm text-gray-600">{status}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          Population health segmentation drives service demand projections. 
          Chronic conditions are expected to increase by 22% over the forecast period.
        </p>
      </div>
    </div>
  );

  const DataImportModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Import Data</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option>Population Data</option>
              <option>Workforce Supply Data</option>
              <option>Service Utilization Data</option>
              <option>Health Status Data</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
            <input type="file" accept=".csv,.xlsx,.xls" className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowDataImport(false)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ScenarioModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Create New Scenario</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scenario Name</label>
            <input type="text" className="w-full border border-gray-300 rounded-md px-3 py-2" placeholder="e.g., Increased Training Seats" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea className="w-full border border-gray-300 rounded-md px-3 py-2" rows="3" placeholder="Describe the scenario changes..."></textarea>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowScenarioModal(false)}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button 
              onClick={() => createNewScenario({ name: 'New Scenario', description: 'Test scenario' })}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nova Scotia Primary Care Workforce Planning</h1>
              <p className="text-sm text-gray-600">Multi-Professional Needs-Based Analytics Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                {Array.from({length: 11}, (_, i) => 2024 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <button 
                onClick={() => setShowDataImport(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Import Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('executive')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'executive' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Executive View
            </button>
            <button
              onClick={() => setCurrentView('analyst')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'analyst' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analyst View
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'executive' ? <ExecutiveView /> : <AnalystView />}
      </main>

      {/* Modals */}
      {showDataImport && <DataImportModal />}
      {showScenarioModal && <ScenarioModal />}
    </div>
  );
}

export default App;