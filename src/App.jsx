import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area } from 'recharts';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700 mb-4">An error occurred while rendering the application.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Extract parameter grid components outside App to prevent recreation
const ParameterGridWithBaseline = React.memo(({ title, parameterType, parameters, baselineParameters, onUpdate, occupations, isPercentage = false, selectedParameterYear }) => {
  const inputRefs = React.useRef({});
  const [focusedInput, setFocusedInput] = React.useState(null);

  // Use useCallback to prevent unnecessary re-renders
  const handleInputChange = React.useCallback((paramType, year, occupation, value) => {
    const inputKey = `${paramType}-${year}-${occupation}`;
    setFocusedInput(inputKey);
    onUpdate(paramType, year, occupation, value);
  }, [onUpdate]);

  const handleInputFocus = React.useCallback((paramType, year, occupation) => {
    const inputKey = `${paramType}-${year}-${occupation}`;
    setFocusedInput(inputKey);
  }, []);

  // Restore focus after re-render
  React.useEffect(() => {
    if (focusedInput && inputRefs.current[focusedInput]) {
      const input = inputRefs.current[focusedInput];
      // Use setTimeout to ensure the input is available in the next tick
      setTimeout(() => {
        if (input && document.contains(input)) {
          input.focus();
          // Move cursor to end of input
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }, 0);
    }
  }, [parameters, focusedInput]);

  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {occupations.map(occ => {
            const baseline = baselineParameters[selectedParameterYear][occ];
            const current = parameters[selectedParameterYear][occ];
            const change = ((current - baseline) / baseline * 100).toFixed(1);
            const inputKey = `${parameterType}-${selectedParameterYear}-${occ}`;

            return (
              <div key={occ} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{occ}</label>
                <div className="space-y-1">
                  <input
                    ref={(el) => {
                      if (el) {
                        inputRefs.current[inputKey] = el;
                      }
                    }}
                    type="number"
                    step={isPercentage ? "0.01" : "1"}
                    value={current}
                    onChange={(e) => handleInputChange(parameterType, selectedParameterYear, occ, e.target.value)}
                    onFocus={() => handleInputFocus(parameterType, selectedParameterYear, occ)}
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
});

const DemandParameterGrid = React.memo(({ title, parameterType, parameters, baselineParameters, onUpdate, categories, selectedParameterYear }) => {
  const inputRefs = React.useRef({});
  const [focusedInput, setFocusedInput] = React.useState(null);

  // Use useCallback to prevent unnecessary re-renders
  const handleInputChange = React.useCallback((paramType, year, category, value) => {
    const inputKey = `${paramType}-${year}-${category}`;
    setFocusedInput(inputKey);
    onUpdate(paramType, year, category, value);
  }, [onUpdate]);

  const handleInputFocus = React.useCallback((paramType, year, category) => {
    const inputKey = `${paramType}-${year}-${category}`;
    setFocusedInput(inputKey);
  }, []);

  // Restore focus after re-render
  React.useEffect(() => {
    if (focusedInput && inputRefs.current[focusedInput]) {
      const input = inputRefs.current[focusedInput];
      // Use setTimeout to ensure the input is available in the next tick
      setTimeout(() => {
        if (input && document.contains(input)) {
          input.focus();
          // Move cursor to end of input
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }
      }, 0);
    }
  }, [parameters, focusedInput]);

  return (
    <div>
      <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => {
            const baseline = baselineParameters[selectedParameterYear][cat];
            const current = parameters[selectedParameterYear][cat];
            const change = ((current - baseline) / baseline * 100).toFixed(1);
            const inputKey = `${parameterType}-${selectedParameterYear}-${cat}`;

            return (
              <div key={cat} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{cat}</label>
                <div className="space-y-1">
                  <input
                    ref={(el) => {
                      if (el) {
                        inputRefs.current[inputKey] = el;
                      }
                    }}
                    type="number"
                    step="0.001"
                    value={current}
                    onChange={(e) => handleInputChange(parameterType, selectedParameterYear, cat, e.target.value)}
                    onFocus={() => handleInputFocus(parameterType, selectedParameterYear, cat)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      Baseline: {(baseline * 100).toFixed(1)}%
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
});

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
  const [visualizationsNeedUpdate, setVisualizationsNeedUpdate] = React.useState(false);
  const [lastAppliedProjections, setLastAppliedProjections] = React.useState(null);

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
    try {
      const years = Array.from({length: 11}, (_, i) => 2024 + i);
      const occupations = ['Physicians', 'Nurse Practitioners', 'Registered Nurses', 'Licensed Practical Nurses', 'Medical Office Assistants'];

      return years.reduce((acc, year) => {
        acc[year] = {};
        occupations.forEach(occ => {
          try {
            let baseSupply = parameters && parameters.supply && parameters.supply[year] && parameters.supply[year][occ] 
              ? parameters.supply[year][occ] 
              : {
                'Physicians': 2500,
                'Nurse Practitioners': 800,
                'Registered Nurses': 4200,
                'Licensed Practical Nurses': 1800,
                'Medical Office Assistants': 3200
              }[occ];

            if (parameters && parameters.supply && parameters.supply[year]) {
              // Calculate supply with all inflows and outflows - with safety checks
              const educationalInflow = parameters.educationalInflow?.[year]?.[occ] || 0;
              const internationalMigrants = parameters.internationalMigrants?.[year]?.[occ] || 0;
              const domesticMigrants = parameters.domesticMigrants?.[year]?.[occ] || 0;
              const reEntrants = parameters.reEntrants?.[year]?.[occ] || 0;
              const retirementRate = parameters.retirementRate?.[year]?.[occ] || 0;
              const attritionRate = parameters.attritionRate?.[year]?.[occ] || 0;

              const inflows = educationalInflow + internationalMigrants + domesticMigrants + reEntrants;
              const outflows = baseSupply * (retirementRate + attritionRate);
              baseSupply = Math.max(0, baseSupply + inflows - outflows); // Ensure non-negative
            }

            const baseDemand = baseSupply * 1.1; // 10% shortage baseline
            const yearMultiplier = 1 + (year - 2024) * 0.02; // 2% annual growth

            const supply = Math.round(Math.max(0, parameters ? baseSupply : baseSupply * yearMultiplier * (0.95 + Math.random() * 0.1)));
            const demand = Math.round(Math.max(0, baseDemand * yearMultiplier));

            acc[year][occ] = {
              supply: supply,
              demand: demand,
              gap: demand - supply
            };
          } catch (occupationError) {
            console.warn(`Error processing occupation ${occ} for year ${year}:`, occupationError);
            // Provide fallback values
            acc[year][occ] = {
              supply: 1000,
              demand: 1100,
              gap: 100
            };
          }
        });
        return acc;
      }, {});
    } catch (error) {
      console.error('Error generating sample projections:', error);
      // Return minimal fallback data
      return {
        2024: {
          'Physicians': { supply: 2500, demand: 2750, gap: 250 },
          'Nurse Practitioners': { supply: 800, demand: 880, gap: 80 },
          'Registered Nurses': { supply: 4200, demand: 4620, gap: 420 },
          'Licensed Practical Nurses': { supply: 1800, demand: 1980, gap: 180 },
          'Medical Office Assistants': { supply: 3200, demand: 3520, gap: 320 }
        }
      };
    }
  }

  const applyParameterChanges = React.useCallback(() => {
    try {
      // Generate new projections based on current editing parameters
      const newProjections = generateSampleProjections(editingParameters);

      if (activeScenario === 'baseline') {
        // For baseline, create a temporary working scenario
        const workingScenario = {
          id: 'working',
          name: 'Working Changes',
          description: 'Applied parameter changes - save as scenario to keep',
          parameters: JSON.parse(JSON.stringify(editingParameters)),
          projections: newProjections,
          createdAt: new Date().toISOString(),
          isTemporary: true
        };

        // Add or update the working scenario
        const updatedScenarios = scenarios.filter(s => s.id !== 'working');
        setScenarios([...updatedScenarios, workingScenario]);
        setActiveScenario('working');
      } else {
        // Update existing scenario
        const updatedScenarios = scenarios.map(scenario => 
          scenario.id === activeScenario 
            ? { ...scenario, parameters: JSON.parse(JSON.stringify(editingParameters)), projections: newProjections }
            : scenario
        );
        setScenarios(updatedScenarios);
      }

      // Store the new projections and trigger visualization updates
      setLastAppliedProjections(newProjections);
      setVisualizationsNeedUpdate(true);
      setUnsavedChanges(false);
      setPendingChanges({});

      console.log('Applied changes to visualizations');
    } catch (error) {
      console.error('Error applying parameter changes:', error);
      setUnsavedChanges(true);
    }
  }, [editingParameters, activeScenario, scenarios]);

  const resetParameters = () => {
    if (activeScenario === 'baseline' || activeScenario === 'working') {
      // Always use the immutable baseline parameters
      setEditingParameters(JSON.parse(JSON.stringify(workforceData.baselineParameters)));
      if (activeScenario === 'working') {
        // Remove working scenario and return to baseline
        setScenarios(scenarios.filter(s => s.id !== 'working'));
        setActiveScenario('baseline');
      }
    } else {
      const scenario = scenarios.find(s => s.id === activeScenario);
      if (scenario) {
        // Use the scenario's saved parameters
        setEditingParameters(JSON.parse(JSON.stringify(scenario.parameters)));
      }
    }
    setUnsavedChanges(false);
    setPendingChanges({});
  };

  const resetToBaseline = () => {
    // Always use the immutable baseline parameters
    setEditingParameters(JSON.parse(JSON.stringify(workforceData.baselineParameters)));
    // Remove working scenario if it exists
    setScenarios(scenarios.filter(s => s.id !== 'working'));
    setActiveScenario('baseline');
    setUnsavedChanges(false);
    setPendingChanges({});
    setVisualizationsNeedUpdate(false);
    setLastAppliedProjections(null);
  };

  // Effect to handle visualization updates only when changes are applied
  React.useEffect(() => {
    if (visualizationsNeedUpdate && lastAppliedProjections) {
      console.log('Updating specific visualizations with applied changes');
      // Reset the flag after processing
      setVisualizationsNeedUpdate(false);
    }
  }, [visualizationsNeedUpdate, lastAppliedProjections]);

  const updateParameter = React.useCallback((paramType, year, occupation, value) => {
    try {
      // Create a completely new parameter object to avoid any reference issues
      const newParams = JSON.parse(JSON.stringify(editingParameters));
      if (!newParams[paramType]) {
        newParams[paramType] = {};
      }
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
    } catch (error) {
      console.error('Error updating parameter:', error);
      // Reset to previous state if update fails
      setEditingParameters(prev => prev);
    }
  }, [editingParameters]);

  const createNewScenario = React.useCallback((scenarioData) => {
    try {
      console.log('Creating scenario with data:', scenarioData);
      console.log('Current editing parameters:', editingParameters);

      const scenarioProjections = generateSampleProjections(editingParameters);

      const newScenario = {
        id: Date.now().toString(),
        name: scenarioData.name || 'Unnamed Scenario',
        description: scenarioData.description || '',
        parameters: JSON.parse(JSON.stringify(editingParameters)), // Deep copy
        projections: scenarioProjections,
        createdAt: new Date().toISOString()
      };

      console.log('New scenario created:', newScenario);

      // Remove working scenario if it exists and add the new permanent scenario
      const filteredScenarios = scenarios.filter(s => s.id !== 'working');
      const updatedScenarios = [...filteredScenarios, newScenario];
      setScenarios(updatedScenarios);
      setActiveScenario(newScenario.id);
      setShowScenarioModal(false);
      setUnsavedChanges(false);
      setPendingChanges({});

      console.log('Updated scenarios list:', updatedScenarios);
    } catch (error) {
      console.error('Error creating new scenario:', error);
      alert('Error creating scenario. Please try again.');
    }
  }, [editingParameters, scenarios]);

  const getCurrentScenarioProjections = () => {
    try {
      if (currentView === 'executive') {
        // Executive View ALWAYS shows baseline projections - never affected by analyst changes
        return executiveData.projections;
      }

      // Analyst View shows applied scenario projections
      if (activeScenario === 'baseline') {
        // Always show baseline projections
        return executiveData.projections;
      } else {
        // Show the saved scenario projections (including working scenario)
        const scenario = scenarios.find(s => s.id === activeScenario);
        return scenario?.projections || executiveData.projections;
      }
    } catch (error) {
      console.error('Error getting current scenario projections:', error);
      return executiveData.projections;
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
                <span className="text-sm text-orange-600 font-medium">Parameters modified</span>
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
              </>
            )}
            <button 
              onClick={resetToBaseline}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:blue-700 text-sm"
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
              selectedParameterYear={selectedParameterYear}
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
                selectedParameterYear={selectedParameterYear}
              />
              <ParameterGridWithBaseline 
                title="International Migrants (Annual)"
                parameterType="internationalMigrants"
                parameters={editingParameters.internationalMigrants}
                baselineParameters={workforceData.baselineParameters.internationalMigrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                selectedParameterYear={selectedParameterYear}
              />
              <ParameterGridWithBaseline 
                title="Domestic Migrants (Annual)"
                parameterType="domesticMigrants"
                parameters={editingParameters.domesticMigrants}
                baselineParameters={workforceData.baselineParameters.domesticMigrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                selectedParameterYear={selectedParameterYear}
              />
              <ParameterGridWithBaseline 
                title="Re-Entrants (Annual)"
                parameterType="reEntrants"
                parameters={editingParameters.reEntrants}
                baselineParameters={workforceData.baselineParameters.reEntrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                selectedParameterYear={selectedParameterYear}
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
                selectedParameterYear={selectedParameterYear}
              />
              <ParameterGridWithBaseline 
                title="Attrition Rate (%)"
                parameterType="attritionRate"
                parameters={editingParameters.attritionRate}
                baselineParameters={workforceData.baselineParameters.attritionRate}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                isPercentage={true}
                selectedParameterYear={selectedParameterYear}
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
                selectedParameterYear={selectedParameterYear}
              />
              <DemandParameterGrid 
                title="Health Status Change (% per year)"
                parameterType="healthStatusChange"
                parameters={editingParameters.healthStatusChange}
                baselineParameters={workforceData.baselineParameters.healthStatusChange}
                onUpdate={updateParameter}
                categories={['Major Chronic', 'Minor Acute', 'Palliative', 'Healthy']}
                selectedParameterYear={selectedParameterYear}
              />
              <DemandParameterGrid 
                title="Service Utilization Change (% per year)"
                parameterType="serviceUtilization"
                parameters={editingParameters.serviceUtilization}
                baselineParameters={workforceData.baselineParameters.serviceUtilization}
                onUpdate={updateParameter}
                categories={['Primary Care Visits', 'Preventive Care', 'Chronic Disease Management', 'Mental Health Services']}
                selectedParameterYear={selectedParameterYear}
              />
            </div>
          )}

          {activeParameterTab === 'scenarios' && (
            <ScenarioManagement
              scenarios={scenarios}
              activeScenario={activeScenario}
              onCreateScenario={() => setShowScenarioModal(true)}
              onSelectScenario={(scenarioId) => {
                try {
                  console.log('Loading scenario:', scenarioId);
                  console.log('Available scenarios:', scenarios);

                  // Check if there are unsaved changes before switching
                  if (unsavedChanges && scenarioId !== activeScenario) {
                    const confirmSwitch = window.confirm(
                      `You have unsaved parameter changes. Switching scenarios will discard these changes.\n\nRecommended workflow:\n1. Click "Apply Changes" to see results in visualizations\n2. Go to Scenario Management tab\n3. Click "Save as New Scenario" to save your work\n4. Then switch scenarios safely\n\nOr click OK to proceed and discard changes, or Cancel to stay on the current scenario.`
                    );

                    if (!confirmSwitch) {
                      return; // Don't switch scenarios
                    }
                  }

                  if (scenarioId === 'baseline') {
                    console.log('Loading baseline parameters');
                    // Always use the immutable baseline parameters - create a fresh copy
                    setEditingParameters(JSON.parse(JSON.stringify(workforceData.baselineParameters)));
                    // Remove working scenario if switching away
                    setScenarios(scenarios.filter(s => s.id !== 'working'));
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
                      setScenarios(scenarios.filter(s => s.id !== 'working'));
                      setActiveScenario('baseline');
                      setUnsavedChanges(false);
                      setPendingChanges({});
                    }
                  }
                } catch (error) {
                  console.error("An error occurred while loading the scenario", error);
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">
              Projected Workforce Gap Trends 
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({activeScenario === 'baseline' 
                  ? 'Baseline' 
                  : activeScenario === 'working'
                    ? 'Working Changes (applied)'
                    : scenarios.find(s => s.id === activeScenario)?.name || 'Current Scenario'})
              </span>
            </h3>
            {activeScenario === 'working' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                APPLIED CHANGES
              </span>
            )}
          </div>
          
          {/* Add occupation filter to the Projected Workforce Gap Trends chart */}
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
          
          {/* Only render when changes are applied or scenario is loaded */}
          {(activeScenario !== 'baseline' || !unsavedChanges) ? (
            <WorkforceGapTrendChart 
              data={getCurrentScenarioProjections()} 
              selectedOccupations={getFilteredOccupations()}
            />
          ) : (
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Chart will update when changes are applied</p>
                <p className="text-sm text-gray-500">Make parameter adjustments and click "Apply Changes"</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Supply vs Demand Analysis</h3>
            {activeScenario === 'working' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                APPLIED CHANGES
              </span>
            )}
          </div>
          
          {/* Add occupation filter to the Supply vs Demand Analysis chart */}
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
          
          {/* Only render when changes are applied or scenario is loaded */}
          {(activeScenario !== 'baseline' || !unsavedChanges) ? (
            <DetailedSupplyDemandChart data={getCurrentScenarioProjections()} />
          ) : (
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Chart will update when changes are applied</p>
                <p className="text-sm text-gray-500">Make parameter adjustments and click "Apply Changes"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Parameter Impact Analysis</h3>
            {activeScenario === 'working' && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                APPLIED CHANGES
              </span>
            )}
          </div>
          
          {/* Add occupation filter to the Parameter Impact Analysis chart */}
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
          
          {/* Only render when changes are applied or scenario is loaded */}
          {(activeScenario !== 'baseline' || !unsavedChanges) ? (
            <ParameterImpactChart parameters={
              activeScenario === 'baseline' 
                ? workforceData.baselineParameters 
                : scenarios.find(s => s.id === activeScenario)?.parameters || workforceData.baselineParameters
            } />
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Chart will update when changes are applied</p>
                <p className="text-sm text-gray-500">Make parameter adjustments and click "Apply Changes"</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Population Health Segments</h3>
          <PopulationSegmentAnalysis />
        </div>
      </div>
    </div>
  );



  const exportScenarioToExcel = React.useCallback((scenarioId) => {
    try {
      // Check if XLSX is already loaded to prevent multiple loads during HMR
      if (window.XLSX) {
        handleExcelExport(window.XLSX, scenarioId);
        return;
      }

      // Dynamically import xlsx to avoid build issues
      import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs').then((XLSX) => {
        window.XLSX = XLSX; // Cache for HMR
        handleExcelExport(XLSX, scenarioId);
      }).catch(error => {
        console.error('Error loading XLSX library:', error);
        alert('Error loading Excel export library. Please try again.');
      });
    } catch (error) {
      console.error('Error exporting scenario:', error);
      alert('Error exporting scenario. Please try again.');
    }
  }, [scenarios, workforceData, executiveData]);

  const handleExcelExport = React.useCallback((XLSX, scenarioId) => {
    try {
        let scenarioData, scenarioName;

      if (scenarioId === 'baseline') {
        scenarioData = {
          parameters: workforceData.baselineParameters,
          projections: executiveData.projections
        };
        scenarioName = 'Baseline';
      } else {
        const scenario = scenarios.find(s => s.id === scenarioId);
        if (!scenario) {
          alert('Scenario not found');
          return;
        }
        scenarioData = {
          parameters: scenario.parameters,
          projections: scenario.projections
        };
        scenarioName = scenario.name;
      }

      const workbook = XLSX.utils.book_new();

      // Create summary sheet
      const summaryData = [
        ['Scenario Name', scenarioName],
        ['Export Date', new Date().toLocaleDateString()],
        ['Years Covered', '2024-2034'],
        ['Occupations', workforceData.occupations.join(', ')],
        [''],
        ['Summary Statistics'],
        ['Year', 'Total Supply', 'Total Demand', 'Total Gap']
      ];

      Object.keys(scenarioData.projections).sort().forEach(year => {
        const yearData = scenarioData.projections[year];
        const totalSupply = Object.values(yearData).reduce((sum, occ) => sum + (occ.supply || 0), 0);
        const totalDemand = Object.values(yearData).reduce((sum, occ) => sum + (occ.demand || 0), 0);
        const totalGap = totalDemand - totalSupply;
        summaryData.push([year, totalSupply, totalDemand, totalGap]);
      });

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Create detailed projections sheet
      const projectionsData = [
        ['Year', 'Occupation', 'Supply', 'Demand', 'Gap']
      ];

      Object.keys(scenarioData.projections).sort().forEach(year => {
        const yearData = scenarioData.projections[year];
        workforceData.occupations.forEach(occ => {
          const occData = yearData[occ] || { supply: 0, demand: 0, gap: 0 };
          projectionsData.push([year, occ, occData.supply, occData.demand, occData.gap]);
        });
      });

      const projectionsSheet = XLSX.utils.aoa_to_sheet(projectionsData);
      XLSX.utils.book_append_sheet(workbook, projectionsSheet, 'Workforce Projections');

      // Create parameters sheets
      const parameterTypes = [
        { key: 'supply', name: 'Current Supply' },
        { key: 'educationalInflow', name: 'Educational Inflow' },
        { key: 'internationalMigrants', name: 'International Migrants' },
        { key: 'domesticMigrants', name: 'Domestic Migrants' },
        { key: 'reEntrants', name: 'Re-Entrants' },
        { key: 'retirementRate', name: 'Retirement Rate' },
        { key: 'attritionRate', name: 'Attrition Rate' }
      ];

      parameterTypes.forEach(paramType => {
        const paramData = [['Year', ...workforceData.occupations]];

        Object.keys(scenarioData.parameters[paramType.key] || {}).sort().forEach(year => {
          const yearParams = scenarioData.parameters[paramType.key][year] || {};
          const row = [year];
          workforceData.occupations.forEach(occ => {
            row.push(yearParams[occ] || 0);
          });
          paramData.push(row);
        });

        const paramSheet = XLSX.utils.aoa_to_sheet(paramData);
        XLSX.utils.book_append_sheet(workbook, paramSheet, paramType.name);
      });

      // Create demand parameters sheet
      const demandData = [
        ['Year', 'Parameter', 'Value']
      ];

      ['populationGrowth', 'healthStatusChange', 'serviceUtilization'].forEach(paramType => {
        Object.keys(scenarioData.parameters[paramType] || {}).sort().forEach(year => {
          const yearParams = scenarioData.parameters[paramType][year] || {};
          Object.keys(yearParams).forEach(category => {
            demandData.push([year, `${paramType} - ${category}`, yearParams[category]]);
          });
        });
      });

      const demandSheet = XLSX.utils.aoa_to_sheet(demandData);
      XLSX.utils.book_append_sheet(workbook, demandSheet, 'Demand Parameters');

      // Generate filename and download
      const filename = `${scenarioName.replace(/[^a-z0-9]/gi, '_')}_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, filename);

      console.log(`Exported scenario: ${scenarioName}`);
    } catch (error) {
      console.error('Error in Excel export:', error);
      alert('Error during Excel export. Please try again.');
    }
  }, [scenarios, workforceData, executiveData]);

  const ScenarioManagement = ({ scenarios, activeScenario, onCreateScenario, onSelectScenario }) => {
    const [showExportInfo, setShowExportInfo] = React.useState(false);

    return (
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
              {activeScenario === 'working' ? 'Save as New Scenario' : 'Create New Scenario'}
            </button>
            <div className="flex-1 flex items-center space-x-2">
              <button 
                onClick={() => exportScenarioToExcel(activeScenario)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Export to Excel
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowExportInfo(!showExportInfo)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Export information"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>

                {showExportInfo && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-800">Export Information</h5>
                      <button 
                        onClick={() => setShowExportInfo(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Excel exports include comprehensive data for the active scenario:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1 mb-3">
                      <li>• Summary statistics and projections for all years (2024-2034)</li>
                      <li>• Detailed workforce supply, demand, and gap data by occupation</li>
                      <li>• All parameter values (supply, inflows, outflows, demand drivers)</li>
                      <li>• Population growth and health status change assumptions</li>
                      <li>• Service utilization parameters</li>
                    </ul>
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <strong>Active Scenario:</strong> {activeScenario === 'baseline' ? 'Baseline' : scenarios.find(s => s.id === activeScenario)?.name || 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {activeScenario === 'working' && (
        <div className="p-4 bg-orange-50 rounded-lg">
          <p className="text-sm text-orange-800">
            <strong>Working Changes:</strong> You have applied parameter changes that are now visible in the visualizations. 
            Click "Save as New Scenario" above to permanently save these changes, or load a different scenario to discard them.
          </p>
        </div>
      )}

      {scenarios.length > 0 && (
        <div className="mt-6">
          <h5 className="font-medium text-gray-800 mb-3">Saved Scenarios</h5>
          <div className="space-y-2">
            {scenarios.map(scenario => (
              <div key={scenario.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{scenario.name}</p>
                  <p className="text-sm text-gray-600">{scenario.description || 'No description'}</p>
                  <p className="text-xs text-gray-500">Created: {new Date(scenario.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onSelectScenario(scenario.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded"
                  >
                    Load
                  </button>
                  <button 
                    onClick={() => exportScenarioToExcel(scenario.id)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded"
                    title="Export this scenario to Excel"
                  >
                    Export
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded">
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
};

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">Create New Scenario</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scenario Name</label>
              <input 
                type="text" 
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="e.g., Increased Training Seats" 
                autoFocus
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{scenarioName.length}/50 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <textarea 
                value={scenarioDescription}
                onChange={(e) => setScenarioDescription(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                rows="3" 
                placeholder="Describe the scenario changes..."
                maxLength={200}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">{scenarioDescription.length}/200 characters</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreate}
                disabled={!scenarioName.trim()}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Scenario
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Clean up any existing timers or intervals during HMR
  React.useEffect(() => {
    return () => {
      // Clear any pending timeouts or intervals
      const highestTimeoutId = setTimeout(";");
      for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
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
        <ErrorBoundary>
          {currentView === 'executive' ? <ExecutiveView /> : <AnalystView />}
        </ErrorBoundary>
      </main>

      {/* Modals */}
      {showDataImport && <DataImportModal />}
      {showScenarioModal && <ScenarioModal />}
      </div>
    </ErrorBoundary>
  );
}

export default App;