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
const ParameterGridWithBaseline = React.memo(({ title, parameterType, parameters, baselineParameters, onUpdate, occupations, isPercentage = false, selectedParameterYear, adjustmentMode, setAdjustmentMode }) => {
  const inputRefs = React.useRef({});
  const [focusedInput, setFocusedInput] = React.useState(null);

  // Use useCallback to prevent unnecessary re-renders
  const handleInputChange = React.useCallback((paramType, year, occupation, value) => {
    const inputKey = `${paramType}-${year}-${occupation}`;
    setFocusedInput(inputKey);
    
    let finalValue = parseFloat(value) || 0;
    
    // If in percentage mode, convert percentage to absolute value
    if (adjustmentMode === 'percentage') {
      const baseline = baselineParameters[selectedParameterYear][occupation];
      finalValue = baseline * (1 + finalValue / 100);
    }
    
    onUpdate(paramType, year, occupation, finalValue);
  }, [onUpdate, adjustmentMode, baselineParameters, selectedParameterYear]);

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
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Adjustment Mode:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAdjustmentMode('absolute')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                adjustmentMode === 'absolute'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Absolute
            </button>
            <button
              onClick={() => setAdjustmentMode('percentage')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                adjustmentMode === 'percentage'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Percentage
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {occupations.map(occ => {
            const baseline = baselineParameters[selectedParameterYear][occ];
            const current = parameters[selectedParameterYear][occ];
            const change = ((current - baseline) / baseline * 100).toFixed(1);
            const inputKey = `${parameterType}-${selectedParameterYear}-${occ}`;

            // Calculate display value based on adjustment mode
            let displayValue = current;
            if (adjustmentMode === 'percentage') {
              displayValue = (((current - baseline) / baseline) * 100).toFixed(2);
            }

            return (
              <div key={occ} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{occ}</label>
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      ref={(el) => {
                        if (el) {
                          inputRefs.current[inputKey] = el;
                        }
                      }}
                      type="number"
                      step={adjustmentMode === 'percentage' ? "0.1" : (isPercentage ? "0.01" : "1")}
                      value={displayValue}
                      onChange={(e) => handleInputChange(parameterType, selectedParameterYear, occ, e.target.value)}
                      onFocus={() => handleInputFocus(parameterType, selectedParameterYear, occ)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {adjustmentMode === 'percentage' && (
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                        %
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      Baseline: {isPercentage ? `${(baseline * 100).toFixed(1)}%` : baseline.toLocaleString()}
                    </span>
                    <span className={`font-medium ${Math.abs(change) < 0.01 ? 'text-gray-500' : change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(change) < 0.01 ? '=' : change > 0 ? '+' : ''}{change}%
                    </span>
                  </div>
                  {adjustmentMode === 'percentage' && (
                    <div className="text-xs text-gray-600">
                      New value: {current.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

const DemandParameterGrid = React.memo(({ title, parameterType, parameters, baselineParameters, onUpdate, categories, selectedParameterYear, adjustmentMode, setAdjustmentMode }) => {
  const inputRefs = React.useRef({});
  const [focusedInput, setFocusedInput] = React.useState(null);

  // Use useCallback to prevent unnecessary re-renders
  const handleInputChange = React.useCallback((paramType, year, category, value) => {
    const inputKey = `${paramType}-${year}-${category}`;
    setFocusedInput(inputKey);
    
    let finalValue = parseFloat(value) || 0;
    
    // If in percentage mode, convert percentage to absolute value
    if (adjustmentMode === 'percentage') {
      const baseline = baselineParameters[selectedParameterYear][category];
      finalValue = baseline * (1 + finalValue / 100);
    } else {
      // For absolute mode with percentage parameters, convert from percentage input to decimal
      finalValue = finalValue / 100;
    }
    
    onUpdate(paramType, year, category, finalValue);
  }, [onUpdate, adjustmentMode, baselineParameters, selectedParameterYear]);

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
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Adjustment Mode:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setAdjustmentMode('absolute')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                adjustmentMode === 'absolute'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Absolute
            </button>
            <button
              onClick={() => setAdjustmentMode('percentage')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                adjustmentMode === 'percentage'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Percentage
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => {
            const baseline = baselineParameters[selectedParameterYear][cat];
            const current = parameters[selectedParameterYear][cat];
            const change = ((current - baseline) / baseline * 100).toFixed(1);
            const inputKey = `${parameterType}-${selectedParameterYear}-${cat}`;

            // Calculate display value based on adjustment mode
            let displayValue = current;
            if (adjustmentMode === 'percentage') {
              displayValue = (((current - baseline) / baseline) * 100).toFixed(2);
            } else {
              // For absolute mode with percentage parameters, show as percentage
              displayValue = (current * 100).toFixed(3);
            }

            return (
              <div key={cat} className="space-y-2">
                <label className="text-sm font-medium text-gray-700">{cat}</label>
                <div className="space-y-1">
                  <div className="relative">
                    <input
                      ref={(el) => {
                        if (el) {
                          inputRefs.current[inputKey] = el;
                        }
                      }}
                      type="number"
                      step={adjustmentMode === 'percentage' ? "0.1" : "0.001"}
                      value={displayValue}
                      onChange={(e) => handleInputChange(parameterType, selectedParameterYear, cat, e.target.value)}
                      onFocus={() => handleInputFocus(parameterType, selectedParameterYear, cat)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                      %
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      Baseline: {(baseline * 100).toFixed(1)}%
                    </span>
                    <span className={`font-medium ${Math.abs(change) < 0.01 ? 'text-gray-500' : change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {Math.abs(change) < 0.01 ? '=' : change > 0 ? '+' : ''}{change}%
                    </span>
                  </div>
                  {adjustmentMode === 'percentage' && (
                    <div className="text-xs text-gray-600">
                      New value: {(current * 100).toFixed(3)}%
                    </div>
                  )}
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
  const [scenarios, setScenarios] = React.useState(() => {
    // Initialize with empty array and add debug logging
    console.log('Initializing scenarios state');
    return [];
  });
  const [activeScenario, setActiveScenario] = React.useState('baseline');
  const [showScenarioModal, setShowScenarioModal] = React.useState(false);
  const [importedData, setImportedData] = React.useState(null);
  const [showDataImport, setShowDataImport] = React.useState(false);
  const [selectedOccupations, setSelectedOccupations] = React.useState(['All']);
  const [activeParameterTab, setActiveParameterTab] = React.useState('inflows');
  const [selectedParameterYear, setSelectedParameterYear] = React.useState(2024);
  const [unsavedChanges, setUnsavedChanges] = React.useState(false);
  const [pendingChanges, setPendingChanges] = React.useState({}); // Track pending parameter changes
  const [visualizationsNeedUpdate, setVisualizationsNeedUpdate] = React.useState(false);
  const [lastAppliedProjections, setLastAppliedProjections] = React.useState(null);
  const [uploadStatus, setUploadStatus] = React.useState(null);
  const [isUsingUploadedData, setIsUsingUploadedData] = React.useState(false);
  const [adjustmentMode, setAdjustmentMode] = React.useState('absolute'); // 'absolute' or 'percentage'

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
      },
      dataVersion: 1 // Add version to force re-renders when data changes
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

  // CSV parsing utility functions
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }

    return data;
  };

  const processPopulationData = (csvData) => {
    try {
      const populationGrowth = {};
      const years = [...new Set(csvData.map(row => parseInt(row.Year)))].sort();
      const ageGroups = ['0-18', '19-64', '65-84', '85+'];

      years.forEach(year => {
        populationGrowth[year] = {};
        ageGroups.forEach(ageGroup => {
          const currentYearData = csvData.filter(row => 
            parseInt(row.Year) === year && row.Age_Group === ageGroup
          );
          const totalCurrentPop = currentYearData.reduce((sum, row) => 
            sum + parseFloat(row.Projected_Population), 0
          );

          if (year > years[0]) {
            const prevYear = year - 1;
            const prevYearData = csvData.filter(row => 
              parseInt(row.Year) === prevYear && row.Age_Group === ageGroup
            );
            const totalPrevPop = prevYearData.reduce((sum, row) => 
              sum + parseFloat(row.Projected_Population), 0
            );

            if (totalPrevPop > 0) {
              populationGrowth[year][ageGroup] = (totalCurrentPop - totalPrevPop) / totalPrevPop;
            } else {
              populationGrowth[year][ageGroup] = 0.02; // Default 2% growth
            }
          } else {
            populationGrowth[year][ageGroup] = 0.02; // Default for base year
          }
        });
      });

      return populationGrowth;
    } catch (error) {
      console.error('Error processing population data:', error);
      return null;
    }
  };

  const generateParametersFromUploadedData = (populationGrowth) => {
    const years = Object.keys(populationGrowth).map(y => parseInt(y)).sort();
    const occupations = ['Physicians', 'Nurse Practitioners', 'Registered Nurses', 'Licensed Practical Nurses', 'Medical Office Assistants'];
    const ageGroups = ['0-18', '19-64', '65-84', '85+'];

    const params = {
      supply: {},
      educationalInflow: {},
      internationalMigrants: {},
      domesticMigrants: {},
      reEntrants: {},
      retirementRate: {},
      attritionRate: {},
      populationGrowth: populationGrowth,
      healthStatusChange: {},
      serviceUtilization: {}
    };

    years.forEach(year => {
      // Initialize supply parameters based on realistic workforce ratios
      params.supply[year] = {};
      params.educationalInflow[year] = {};
      params.internationalMigrants[year] = {};
      params.domesticMigrants[year] = {};
      params.reEntrants[year] = {};
      params.retirementRate[year] = {};
      params.attritionRate[year] = {};

      // Calculate total population for the year
      const totalPopByAge = Object.values(populationGrowth[year] || {});
      const avgPopGrowth = totalPopByAge.length > 0 ? 
        totalPopByAge.reduce((a, b) => a + b, 0) / totalPopByAge.length : 0.02;

      occupations.forEach(occ => {
        // Base supply calculated from population ratios (per 1000 population)
        const basePopulation = 1000000; // Approximate NS population
        const ratios = {
          'Physicians': 2.5,
          'Nurse Practitioners': 0.8,
          'Registered Nurses': 4.2,
          'Licensed Practical Nurses': 1.8,
          'Medical Office Assistants': 3.2
        };

        const baseSupply = (basePopulation * ratios[occ] / 1000);
        params.supply[year][occ] = Math.round(baseSupply * (1 + avgPopGrowth * (year - 2024)));

        // Set educational inflow based on typical training graduation rates
        params.educationalInflow[year][occ] = {
          'Physicians': Math.round(baseSupply * 0.04), // 4% of workforce annually
          'Nurse Practitioners': Math.round(baseSupply * 0.06),
          'Registered Nurses': Math.round(baseSupply * 0.05),
          'Licensed Practical Nurses': Math.round(baseSupply * 0.08),
          'Medical Office Assistants': Math.round(baseSupply * 0.03)
        }[occ];

        // Set migration parameters
        params.internationalMigrants[year][occ] = Math.round(params.educationalInflow[year][occ] * 0.25);
        params.domesticMigrants[year][occ] = Math.round(params.educationalInflow[year][occ] * 0.15);
        params.reEntrants[year][occ] = Math.round(params.educationalInflow[year][occ] * 0.10);

        // Set retirement and attrition rates
        params.retirementRate[year][occ] = {
          'Physicians': 0.06,
          'Nurse Practitioners': 0.05,
          'Registered Nurses': 0.04,
          'Licensed Practical Nurses': 0.04,
          'Medical Office Assistants': 0.03
        }[occ];

        params.attritionRate[year][occ] = 0.15;
      });

      // Health status changes (derived from population growth patterns)
      params.healthStatusChange[year] = {
        'Health Newborn': avgPopGrowth * 0.1,
        'Major Acute': 0.01,
        'Major Cancer': 0.005,
        'Major Chronic': Math.max(0.015, avgPopGrowth * 1.5), // Chronic conditions grow with aging population
        'Major Mental Health': 0.02,
        'Major Newborn': avgPopGrowth * 0.1,
        'Minor Acute': -0.005,
        'Minor Chronic': 0.01,
        'Moderate Acute': 0.005,
        'Moderate Chronic': 0.015,
        'Obstetrics': avgPopGrowth * 0.2,
        'Other Cancer': 0.003,
        'Other Mental Health': 0.015,
        'Palliative': 0.005,
        'Non-users': -0.01,
        'Users with no health conditions': -0.015
      };

      // Service utilization changes
      params.serviceUtilization[year] = {
        'Primary Care Visits': Math.max(0.01, avgPopGrowth * 1.2),
        'Preventive Care': 0.03,
        'Chronic Disease Management': Math.max(0.02, avgPopGrowth * 2),
        'Mental Health Services': 0.05
      };
    });

    return params;
  };

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
      
      // Initialize baseline supply for 2024
      const baseline2024Supply = {
        'Physicians': 2500,
        'Nurse Practitioners': 800,
        'Registered Nurses': 4200,
        'Licensed Practical Nurses': 1800,
        'Medical Office Assistants': 3200
      };

      return years.reduce((acc, year, yearIndex) => {
        acc[year] = {};
        
        occupations.forEach(occ => {
          try {
            let currentSupply;
            
            if (!parameters) {
              // Baseline calculation without parameters
              const baseSupply = baseline2024Supply[occ];
              const baseDemand = baseSupply * 1.1; // 10% shortage baseline
              const yearMultiplier = 1 + (year - 2024) * 0.02; // 2% annual growth
              const supply = Math.round(Math.max(0, baseSupply * yearMultiplier * (0.95 + Math.random() * 0.1)));
              const demand = Math.round(Math.max(0, baseDemand * yearMultiplier));

              acc[year][occ] = {
                supply: supply,
                demand: demand,
                gap: demand - supply
              };
              return;
            }

            // For first year (2024), use the baseline or provided supply
            if (year === 2024) {
              currentSupply = parameters.supply?.[year]?.[occ] || baseline2024Supply[occ];
            } else {
              // For subsequent years, calculate supply based on previous year plus changes
              const previousYear = year - 1;
              const previousSupply = acc[previousYear][occ].supply;
              
              // Get parameters for current year (or use previous year if not available)
              const educationalInflow = parameters.educationalInflow?.[year]?.[occ] || 
                                       parameters.educationalInflow?.[previousYear]?.[occ] || 0;
              const internationalMigrants = parameters.internationalMigrants?.[year]?.[occ] || 
                                           parameters.internationalMigrants?.[previousYear]?.[occ] || 0;
              const domesticMigrants = parameters.domesticMigrants?.[year]?.[occ] || 
                                      parameters.domesticMigrants?.[previousYear]?.[occ] || 0;
              const reEntrants = parameters.reEntrants?.[year]?.[occ] || 
                                parameters.reEntrants?.[previousYear]?.[occ] || 0;
              const retirementRate = parameters.retirementRate?.[year]?.[occ] || 
                                    parameters.retirementRate?.[previousYear]?.[occ] || 0;
              const attritionRate = parameters.attritionRate?.[year]?.[occ] || 
                                   parameters.attritionRate?.[previousYear]?.[occ] || 0;

              // Calculate annual changes
              const inflows = educationalInflow + internationalMigrants + domesticMigrants + reEntrants;
              const outflows = previousSupply * (retirementRate + attritionRate);
              
              currentSupply = Math.max(0, previousSupply + inflows - outflows);
            }

            // Calculate demand for current year
            const baseline2024Demand = {
              'Physicians': 2750,
              'Nurse Practitioners': 880,
              'Registered Nurses': 4620,
              'Licensed Practical Nurses': 1980,
              'Medical Office Assistants': 3520
            }[occ];

            // Apply time-based growth from 2024 baseline
            let demandMultiplier = 1 + (year - 2024) * 0.02; // 2% baseline annual growth

            // Apply demand parameter adjustments if available
            if (parameters.populationGrowth && parameters.populationGrowth[year]) {
              const avgPopGrowth = Object.values(parameters.populationGrowth[year]).reduce((a, b) => a + b, 0) / 4;
              demandMultiplier *= (1 + avgPopGrowth);
            }

            if (parameters.healthStatusChange && parameters.healthStatusChange[year]) {
              const avgHealthChange = Object.values(parameters.healthStatusChange[year]).reduce((a, b) => a + b, 0) / Object.keys(parameters.healthStatusChange[year]).length;
              demandMultiplier *= (1 + avgHealthChange);
            }

            if (parameters.serviceUtilization && parameters.serviceUtilization[year]) {
              const avgServiceChange = Object.values(parameters.serviceUtilization[year]).reduce((a, b) => a + b, 0) / Object.keys(parameters.serviceUtilization[year]).length;
              demandMultiplier *= (1 + avgServiceChange);
            }

            const supply = Math.round(Math.max(0, currentSupply));
            const demand = Math.round(Math.max(0, baseline2024Demand * demandMultiplier));

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
      console.log('=== APPLYING PARAMETER CHANGES ===');
      console.log('Current active scenario:', activeScenario);
      console.log('Current editing parameters snapshot being applied');
      
      // Create a snapshot of current parameters to avoid reference issues
      const parametersSnapshot = JSON.parse(JSON.stringify(editingParameters));
      const newProjections = generateSampleProjections(parametersSnapshot);

      if (activeScenario === 'baseline') {
        // For baseline, create a temporary working scenario
        const workingScenario = {
          id: 'working',
          name: 'Working Changes',
          description: 'Applied parameter changes - save as scenario to keep',
          parameters: parametersSnapshot,
          projections: newProjections,
          createdAt: new Date().toISOString(),
          isTemporary: true
        };

        // Add or update the working scenario
        setScenarios(prevScenarios => {
          const updatedScenarios = prevScenarios.filter(s => s.id !== 'working');
          return [...updatedScenarios, workingScenario];
        });
        setActiveScenario('working');
      } else {
        // Update existing scenario with fresh parameters
        setScenarios(prevScenarios => {
          const updatedScenarios = prevScenarios.map(scenario => 
            scenario.id === activeScenario 
              ? { 
                  ...scenario, 
                  parameters: parametersSnapshot,
                  projections: newProjections 
                }
              : scenario
          );
          console.log('Updated scenarios with applied changes');
          return updatedScenarios;
        });
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
  }, [editingParameters, activeScenario]);

  const resetParameters = React.useCallback(() => {
    React.startTransition(() => {
      if (activeScenario === 'baseline' || activeScenario === 'working') {
        // Use functional update with guaranteed new reference
        setEditingParameters(prevParams => {
          console.log('Resetting to baseline parameters');
          return JSON.parse(JSON.stringify(workforceData.baselineParameters));
        });
        
        if (activeScenario === 'working') {
          // Remove working scenario and return to baseline with functional updates
          setScenarios(prevScenarios => {
            console.log('Removing working scenario during reset');
            return prevScenarios.filter(s => s.id !== 'working');
          });
          
          setActiveScenario(prevActive => {
            console.log('Resetting active scenario to baseline from:', prevActive);
            return 'baseline';
          });
        }
      } else {
        // Find scenario and reset to its saved parameters
        setScenarios(currentScenarios => {
          const scenario = currentScenarios.find(s => s.id === activeScenario);
          if (scenario && scenario.parameters) {
            setEditingParameters(prevParams => {
              console.log('Resetting to scenario parameters for:', scenario.name);
              return JSON.parse(JSON.stringify(scenario.parameters));
            });
          }
          return currentScenarios;
        });
      }
      
      // Clear flags with functional updates
      setUnsavedChanges(prev => {
        console.log('Clearing unsaved changes during reset');
        return false;
      });
      
      setPendingChanges(prev => {
        console.log('Clearing pending changes during reset');
        return {};
      });
    });
  }, [activeScenario, workforceData.baselineParameters]);

  const resetToBaseline = React.useCallback(() => {
    console.log('Resetting to baseline - full reset');
    
    React.startTransition(() => {
      // Use functional updates for all state changes
      setEditingParameters(prevParams => {
        console.log('Setting editing parameters to baseline');
        return JSON.parse(JSON.stringify(workforceData.baselineParameters));
      });
      
      setScenarios(prevScenarios => {
        console.log('Removing working scenario if exists');
        return prevScenarios.filter(s => s.id !== 'working');
      });
      
      setActiveScenario(prevActive => {
        console.log('Setting active scenario to baseline from:', prevActive);
        return 'baseline';
      });
      
      setUnsavedChanges(prev => {
        console.log('Clearing unsaved changes');
        return false;
      });
      
      setPendingChanges(prev => {
        console.log('Clearing pending changes');
        return {};
      });
      
      setVisualizationsNeedUpdate(prev => {
        console.log('Clearing visualization update flag');
        return false;
      });
      
      setLastAppliedProjections(prev => {
        console.log('Clearing last applied projections');
        return null;
      });
    });
  }, [workforceData.baselineParameters]);

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
      // Create a completely independent copy to prevent any reference contamination
      const newParams = JSON.parse(JSON.stringify(editingParameters));
      const newValue = parseFloat(value) || 0;
      
      // Ensure the parameter structure exists
      if (!newParams[paramType]) {
        newParams[paramType] = {};
      }
      
      if (!newParams[paramType]) {
        newParams[paramType] = {};
      }
      if (!newParams[paramType][year]) {
        newParams[paramType][year] = {};
      }
      
      // Update the specific year
      newParams[paramType][year][occupation] = newValue;
      
      // For supply parameters, propagate changes to future years starting from the modified year
      if (paramType === 'supply') {
        const years = Array.from({length: 11}, (_, i) => 2024 + i);
        const currentYearIndex = years.indexOf(year);
        
        // Calculate the change from the baseline value for this year
        const currentScenarioBaseline = getCurrentScenarioBaselineForParameter(paramType, year, occupation);
        const changeRatio = newValue / currentScenarioBaseline;
        
        // Apply proportional change to all future years
        for (let i = currentYearIndex + 1; i < years.length; i++) {
          const futureYear = years[i];
          if (!newParams[paramType][futureYear]) {
            newParams[paramType][futureYear] = {};
          }
          const futureScenarioBaseline = getCurrentScenarioBaselineForParameter(paramType, futureYear, occupation);
          newParams[paramType][futureYear][occupation] = Math.round(futureScenarioBaseline * changeRatio);
        }
      }
      
      // For rate parameters (retirement, attrition), apply the same rate to all future years
      if (paramType === 'retirementRate' || paramType === 'attritionRate') {
        const years = Array.from({length: 11}, (_, i) => 2024 + i);
        const currentYearIndex = years.indexOf(year);
        
        for (let i = currentYearIndex + 1; i < years.length; i++) {
          const futureYear = years[i];
          if (!newParams[paramType][futureYear]) {
            newParams[paramType][futureYear] = {};
          }
          newParams[paramType][futureYear][occupation] = newValue;
        }
      }
      
      // For inflow parameters, only update supply for future years (don't change future inflow values)
      if (['educationalInflow', 'internationalMigrants', 'domesticMigrants', 'reEntrants'].includes(paramType)) {
        const years = Array.from({length: 11}, (_, i) => 2024 + i);
        const currentYearIndex = years.indexOf(year);
        
        // Calculate the change in inflow for this specific year only
        const currentScenarioBaseline = getCurrentScenarioBaselineForParameter(paramType, year, occupation);
        const inflowChange = newValue - currentScenarioBaseline;
        
        // Update supply for future years based on the cumulative effect of this year's change
        for (let i = currentYearIndex + 1; i < years.length; i++) {
          const futureYear = years[i];
          
          if (!newParams.supply[futureYear]) {
            newParams.supply[futureYear] = {};
          }
          
          // Add the one-time inflow change to all future years' supply
          // (the extra people from this year's increased inflow stay in the workforce)
          const currentSupplyBaseline = getCurrentScenarioBaselineForParameter('supply', futureYear, occupation);
          newParams.supply[futureYear][occupation] = Math.max(0, currentSupplyBaseline + inflowChange);
        }
      }
      
      // For demand parameters, apply to future years as well
      if (['populationGrowth', 'healthStatusChange', 'serviceUtilization'].includes(paramType)) {
        const years = Array.from({length: 11}, (_, i) => 2024 + i);
        const currentYearIndex = years.indexOf(year);
        
        for (let i = currentYearIndex + 1; i < years.length; i++) {
          const futureYear = years[i];
          if (!newParams[paramType][futureYear]) {
            newParams[paramType][futureYear] = {};
          }
          newParams[paramType][futureYear][occupation] = newValue;
        }
      }
      
      // Use functional update to ensure proper state isolation
      setEditingParameters(() => newParams);
      setUnsavedChanges(true);

      // Track the specific parameter change
      setPendingChanges(prev => ({
        ...prev,
        [`${paramType}|${year}|${occupation}`]: true
      }));
    } catch (error) {
      console.error('Error updating parameter:', error);
      // Don't reset state on error to prevent data loss
      alert('Error updating parameter. Please try again.');
    }
  }, [editingParameters]);

  // Helper function to get the current scenario's baseline value for a parameter
  const getCurrentScenarioBaselineForParameter = React.useCallback((paramType, year, occupation) => {
    if (activeScenario === 'baseline') {
      return workforceData.baselineParameters[paramType][year][occupation];
    } else {
      const scenario = scenarios.find(s => s.id === activeScenario);
      if (scenario && scenario.parameters && scenario.parameters[paramType] && scenario.parameters[paramType][year]) {
        return scenario.parameters[paramType][year][occupation];
      }
      // Fallback to global baseline if scenario doesn't have this parameter
      return workforceData.baselineParameters[paramType][year][occupation];
    }
  }, [activeScenario, scenarios, workforceData.baselineParameters]);

  // Helper function to get the current scenario's complete baseline parameters
  const getCurrentScenarioBaseline = React.useCallback(() => {
    if (activeScenario === 'baseline') {
      return workforceData.baselineParameters;
    } else {
      const scenario = scenarios.find(s => s.id === activeScenario);
      if (scenario && scenario.parameters) {
        return scenario.parameters;
      }
      // Fallback to global baseline if scenario doesn't have parameters
      return workforceData.baselineParameters;
    }
  }, [activeScenario, scenarios, workforceData.baselineParameters]);

  const createNewScenario = React.useCallback((scenarioData) => {
    try {
      console.log('Creating scenario with data:', scenarioData);
      console.log('Current active scenario when creating:', activeScenario);
      
      // Create a completely independent deep copy to prevent reference sharing
      // Use a more robust deep cloning approach to ensure complete isolation
      const parametersSnapshot = JSON.parse(JSON.stringify(editingParameters));
      
      // Double-check parameter isolation by creating a fresh copy with explicit structure
      const isolatedParameters = {
        supply: JSON.parse(JSON.stringify(parametersSnapshot.supply || {})),
        educationalInflow: JSON.parse(JSON.stringify(parametersSnapshot.educationalInflow || {})),
        internationalMigrants: JSON.parse(JSON.stringify(parametersSnapshot.internationalMigrants || {})),
        domesticMigrants: JSON.parse(JSON.stringify(parametersSnapshot.domesticMigrants || {})),
        reEntrants: JSON.parse(JSON.stringify(parametersSnapshot.reEntrants || {})),
        retirementRate: JSON.parse(JSON.stringify(parametersSnapshot.retirementRate || {})),
        attritionRate: JSON.parse(JSON.stringify(parametersSnapshot.attritionRate || {})),
        populationGrowth: JSON.parse(JSON.stringify(parametersSnapshot.populationGrowth || {})),
        healthStatusChange: JSON.parse(JSON.stringify(parametersSnapshot.healthStatusChange || {})),
        serviceUtilization: JSON.parse(JSON.stringify(parametersSnapshot.serviceUtilization || {}))
      };
      
      console.log('Parameters snapshot created with complete isolation');
      
      const scenarioProjections = generateSampleProjections(isolatedParameters);

      // Create a truly unique ID using timestamp and random components
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substr(2, 9);
      const uniqueId = `scenario_${timestamp}_${randomPart}`;

      // Create the scenario object with completely isolated data
      const newScenario = {
        id: uniqueId,
        name: scenarioData.name || 'Unnamed Scenario',
        description: scenarioData.description || '',
        parameters: isolatedParameters, // Use the explicitly isolated parameters
        projections: scenarioProjections,
        createdAt: new Date().toISOString(),
        sourceScenario: activeScenario // Track what scenario this was created from for debugging
      };

      // Use functional state update with proper isolation
      setScenarios(prevScenarios => {
        console.log('Existing scenarios before creation:', prevScenarios.map(s => ({ id: s.id, name: s.name })));
        
        // Create a completely new array with deep copies of existing scenarios to prevent mutation
        const isolatedExistingScenarios = prevScenarios
          .filter(s => s.id !== 'working')
          .map(scenario => ({
            ...scenario,
            parameters: JSON.parse(JSON.stringify(scenario.parameters)),
            projections: JSON.parse(JSON.stringify(scenario.projections))
          }));
        
        // Ensure the ID is truly unique
        let finalId = uniqueId;
        let counter = 1;
        while (isolatedExistingScenarios.some(s => s.id === finalId)) {
          finalId = `${uniqueId}_${counter}`;
          counter++;
        }

        // Handle duplicate names
        let finalName = newScenario.name;
        const duplicateNameScenarios = isolatedExistingScenarios.filter(s => s.name === finalName);
        if (duplicateNameScenarios.length > 0) {
          finalName = `${finalName} (${duplicateNameScenarios.length + 1})`;
        }

        // Create the final scenario with unique ID and name
        const finalScenario = {
          ...newScenario,
          id: finalId,
          name: finalName
        };

        console.log('New scenario created with ID:', finalId);
        console.log('Source scenario was:', activeScenario);

        const updatedScenarios = [...isolatedExistingScenarios, finalScenario];
        console.log('Scenarios updated from', prevScenarios.length, 'to', updatedScenarios.length);
        console.log('New scenarios list:', updatedScenarios.map(s => ({ id: s.id, name: s.name })));
        
        return updatedScenarios;
      });

      // Set active scenario and cleanup state after scenarios update
      setActiveScenario(uniqueId);
      setShowScenarioModal(false);
      setUnsavedChanges(false);
      setPendingChanges({});
      console.log('Active scenario set to:', uniqueId);

    } catch (error) {
      console.error('Error creating new scenario:', error);
      alert('Error creating scenario. Please try again.');
    }
  }, [editingParameters, activeScenario]);

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
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">Viewing baseline projections</p>
          <div className="text-sm">
            {isUsingUploadedData ? (
              <span className="text-green-600 font-medium">📊 Using Your Uploaded Data</span>
            ) : (
              <span className="text-orange-600 font-medium">⚠️ Using Sample Data - Import your baseline projections for accurate results</span>
            )}
          </div>
        </div>

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
            <h2 className="text-2xl font-bold text-gray-800">Parameter Configuration</h2>
            <p className="text-sm text-gray-600">Adjust workforce parameters and analyze scenario impacts</p>
            <p className="text-xs text-gray-500 mt-1">
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



        {/* Parameter Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
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
          {activeParameterTab === 'inflows' && (
            <div className="space-y-6" key={`inflows-${workforceData.dataVersion}`}>
              {/* Year Selector for Inflow Parameters */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Workforce Inflow Parameters</h3>
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
              <ParameterGridWithBaseline 
                key={`educational-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="Educational Inflow (Annual Graduates)"
                parameterType="educationalInflow"
                parameters={editingParameters.educationalInflow}
                baselineParameters={getCurrentScenarioBaseline().educationalInflow}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
              <ParameterGridWithBaseline 
                key={`international-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="International Migrants (Annual)"
                parameterType="internationalMigrants"
                parameters={editingParameters.internationalMigrants}
                baselineParameters={getCurrentScenarioBaseline().internationalMigrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
              <ParameterGridWithBaseline 
                key={`domestic-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="Domestic Migrants (Annual)"
                parameterType="domesticMigrants"
                parameters={editingParameters.domesticMigrants}
                baselineParameters={getCurrentScenarioBaseline().domesticMigrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
              <ParameterGridWithBaseline 
                key={`reentrants-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="Re-Entrants (Annual)"
                parameterType="reEntrants"
                parameters={editingParameters.reEntrants}
                baselineParameters={getCurrentScenarioBaseline().reEntrants}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
            </div>
          )}

          {activeParameterTab === 'outflows' && (
            <div className="space-y-6" key={`outflows-${workforceData.dataVersion}`}>
              {/* Year Selector for Outflow Parameters */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Retirement & Attrition Parameters</h3>
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
              <ParameterGridWithBaseline 
                key={`retirement-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="Retirement Rate (%)"
                parameterType="retirementRate"
                parameters={editingParameters.retirementRate}
                baselineParameters={getCurrentScenarioBaseline().retirementRate}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                isPercentage={true}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
              <ParameterGridWithBaseline 
                key={`attrition-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="Attrition Rate (%)"
                parameterType="attritionRate"
                parameters={editingParameters.attritionRate}
                baselineParameters={getCurrentScenarioBaseline().attritionRate}
                onUpdate={updateParameter}
                occupations={workforceData.occupations}
                isPercentage={true}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
            </div>
          )}

          {activeParameterTab === 'demand' && (
            <div className="space-y-6" key={`demand-${workforceData.dataVersion}`}>
              {/* Year Selector for Demand Parameters */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Demand Driver Parameters</h3>
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
              <DemandParameterGrid 
                key={`population-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="Population Growth Rate (% per year)"
                parameterType="populationGrowth"
                parameters={editingParameters.populationGrowth}
                baselineParameters={getCurrentScenarioBaseline().populationGrowth}
                onUpdate={updateParameter}
                categories={['0-18', '19-64', '65-84', '85+']}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
              <DemandParameterGrid 
                key={`health-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="Health Status Change (% per year)"
                parameterType="healthStatusChange"
                parameters={editingParameters.healthStatusChange}
                baselineParameters={getCurrentScenarioBaseline().healthStatusChange}
                onUpdate={updateParameter}
                categories={['Major Chronic', 'Minor Acute', 'Palliative', 'Healthy']}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
              <DemandParameterGrid 
                key={`service-grid-${workforceData.dataVersion}-${selectedParameterYear}-${activeScenario}`}
                title="Service Utilization Change (% per year)"
                parameterType="serviceUtilization"
                parameters={editingParameters.serviceUtilization}
                baselineParameters={getCurrentScenarioBaseline().serviceUtilization}
                onUpdate={updateParameter}
                categories={['Primary Care Visits', 'Preventive Care', 'Chronic Disease Management', 'Mental Health Services']}
                selectedParameterYear={selectedParameterYear}
                adjustmentMode={adjustmentMode}
                setAdjustmentMode={setAdjustmentMode}
              />
            </div>
          )}

          {activeParameterTab === 'scenarios' && (
            <ScenarioManagement
              scenarios={scenarios}
              activeScenario={activeScenario}
              workforceData={workforceData}
              executiveData={executiveData}
              selectedOccupations={selectedOccupations}
              toggleOccupation={toggleOccupation}
              getFilteredOccupations={getFilteredOccupations}
              onCreateScenario={() => setShowScenarioModal(true)}
              onSelectScenario={(scenarioId) => {
                try {
                  console.log('=== SCENARIO SELECTION DEBUG ===');
                  console.log('Loading scenario:', scenarioId);
                  console.log('Available scenarios before selection:', scenarios.map(s => ({ id: s.id, name: s.name })));
                  console.log('Current active scenario:', activeScenario);
                  console.log('Scenarios state length:', scenarios.length);

                  // Check if there are unsaved changes before switching
                  if (unsavedChanges && scenarioId !== activeScenario) {
                    const confirmSwitch = window.confirm(
                      `You have unsaved parameter changes. Switching scenarios will discard these changes.\n\nRecommended workflow:\n1. Click "Apply Changes" to see results in visualizations\n2. Go to Scenario Management tab\n3. Click "Save as New Scenario" to save your work\n4. Then switch scenarios safely\n\nOr click OK to proceed and discard changes, or Cancel to stay on the current scenario.`
                    );

                    if (!confirmSwitch) {
                      console.log('User cancelled scenario switch');
                      return; // Don't switch scenarios
                    }
                  }

                  if (scenarioId === 'baseline') {
                    console.log('Loading baseline parameters');
                    
                    // Use functional updates to ensure state consistency
                    React.startTransition(() => {
                      // Create completely fresh copy with guaranteed new reference
                      const baselineParametersCopy = JSON.parse(JSON.stringify(workforceData.baselineParameters));
                      
                      // Update all states with functional updates
                      setEditingParameters(prevParams => {
                        console.log('Previous editing parameters cleared for baseline');
                        return baselineParametersCopy;
                      });
                      
                      setScenarios(prevScenarios => {
                        console.log('Removing working scenario if exists');
                        return prevScenarios.filter(s => s.id !== 'working');
                      });
                      
                      setActiveScenario(prevActive => {
                        console.log('Setting active scenario to baseline from:', prevActive);
                        return 'baseline';
                      });
                      
                      setUnsavedChanges(prev => {
                        console.log('Clearing unsaved changes flag');
                        return false;
                      });
                      
                      setPendingChanges(prev => {
                        console.log('Clearing pending changes');
                        return {};
                      });
                    });
                  } else {
                    // Use functional state updates for scenario loading
                    setScenarios(currentScenarios => {
                      const scenario = currentScenarios.find(s => s.id === scenarioId);
                      console.log('Found scenario:', scenario ? { id: scenario.id, name: scenario.name, hasParameters: !!scenario.parameters } : 'NOT FOUND');
                      
                      if (scenario && scenario.parameters) {
                        console.log('Loading scenario parameters for:', scenario.name);
                        
                        // Use React.startTransition for better performance
                        React.startTransition(() => {
                          // Create completely independent copy with explicit structure isolation
                          const scenarioParametersCopy = {
                            supply: JSON.parse(JSON.stringify(scenario.parameters.supply || {})),
                            educationalInflow: JSON.parse(JSON.stringify(scenario.parameters.educationalInflow || {})),
                            internationalMigrants: JSON.parse(JSON.stringify(scenario.parameters.internationalMigrants || {})),
                            domesticMigrants: JSON.parse(JSON.stringify(scenario.parameters.domesticMigrants || {})),
                            reEntrants: JSON.parse(JSON.stringify(scenario.parameters.reEntrants || {})),
                            retirementRate: JSON.parse(JSON.stringify(scenario.parameters.retirementRate || {})),
                            attritionRate: JSON.parse(JSON.stringify(scenario.parameters.attritionRate || {})),
                            populationGrowth: JSON.parse(JSON.stringify(scenario.parameters.populationGrowth || {})),
                            healthStatusChange: JSON.parse(JSON.stringify(scenario.parameters.healthStatusChange || {})),
                            serviceUtilization: JSON.parse(JSON.stringify(scenario.parameters.serviceUtilization || {}))
                          };
                          
                          // Update all states with functional updates
                          setEditingParameters(prevParams => {
                            console.log('Previous editing parameters completely replaced with isolated scenario parameters');
                            return scenarioParametersCopy;
                          });
                          
                          setActiveScenario(prevActive => {
                            console.log('Active scenario changed from:', prevActive, 'to:', scenarioId);
                            return scenarioId;
                          });
                          
                          setUnsavedChanges(prev => {
                            console.log('Clearing unsaved changes flag for scenario load');
                            return false;
                          });
                          
                          setPendingChanges(prev => {
                            console.log('Clearing pending changes for scenario load');
                            return {};
                          });
                        });
                        
                        console.log('Successfully loaded scenario with isolated parameters:', scenario.name);
                      } else {
                        console.error('Scenario not found or missing parameters:', scenarioId);
                        console.error('Available scenario IDs:', currentScenarios.map(s => s.id));
                        
                        // Show user-friendly error
                        alert(`Error: Could not load scenario "${scenarioId}". The scenario may have been deleted or corrupted.`);
                        
                        // Fallback to baseline with functional updates
                        React.startTransition(() => {
                          const baselineParametersCopy = {
                            supply: JSON.parse(JSON.stringify(workforceData.baselineParameters.supply || {})),
                            educationalInflow: JSON.parse(JSON.stringify(workforceData.baselineParameters.educationalInflow || {})),
                            internationalMigrants: JSON.parse(JSON.stringify(workforceData.baselineParameters.internationalMigrants || {})),
                            domesticMigrants: JSON.parse(JSON.stringify(workforceData.baselineParameters.domesticMigrants || {})),
                            reEntrants: JSON.parse(JSON.stringify(workforceData.baselineParameters.reEntrants || {})),
                            retirementRate: JSON.parse(JSON.stringify(workforceData.baselineParameters.retirementRate || {})),
                            attritionRate: JSON.parse(JSON.stringify(workforceData.baselineParameters.attritionRate || {})),
                            populationGrowth: JSON.parse(JSON.stringify(workforceData.baselineParameters.populationGrowth || {})),
                            healthStatusChange: JSON.parse(JSON.stringify(workforceData.baselineParameters.healthStatusChange || {})),
                            serviceUtilization: JSON.parse(JSON.stringify(workforceData.baselineParameters.serviceUtilization || {}))
                          };
                          
                          setEditingParameters(prevParams => {
                            console.log('Fallback to isolated baseline parameters due to error');
                            return baselineParametersCopy;
                          });
                          
                          setActiveScenario(prevActive => {
                            console.log('Fallback to baseline scenario from:', prevActive);
                            return 'baseline';
                          });
                          
                          setUnsavedChanges(prev => false);
                          setPendingChanges(prev => ({}));
                        });
                      }
                      
                      // Return completely isolated scenarios array to prevent cross-contamination
                      return currentScenarios
                        .filter(s => s.id !== 'working')
                        .map(s => ({
                          ...s,
                          parameters: JSON.parse(JSON.stringify(s.parameters)),
                          projections: JSON.parse(JSON.stringify(s.projections))
                        }));
                    });
                  }
                } catch (error) {
                  console.error("An error occurred while loading the scenario", error);
                  alert('Error loading scenario. Please try again.');
                  
                  // Emergency fallback to baseline with functional updates
                  React.startTransition(() => {
                    const safeBaselineParams = JSON.parse(JSON.stringify(workforceData.baselineParameters));
                    
                    setEditingParameters(prev => safeBaselineParams);
                    setActiveScenario(prev => 'baseline');
                    setUnsavedChanges(prev => false);
                    setPendingChanges(prev => ({}));
                  });
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Visualizations */}
      <div className="space-y-6">
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
            <DetailedSupplyDemandChart 
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

  const ScenarioManagement = ({ 
    scenarios, 
    activeScenario, 
    workforceData, 
    executiveData, 
    selectedOccupations, 
    toggleOccupation, 
    getFilteredOccupations, 
    onCreateScenario, 
    onSelectScenario 
  }) => {
    const [showExportInfo, setShowExportInfo] = React.useState(false);
    const [selectedScenariosForComparison, setSelectedScenariosForComparison] = React.useState(['baseline']);
    const [showComparison, setShowComparison] = React.useState(false);

    const toggleScenarioForComparison = (scenarioId) => {
      setSelectedScenariosForComparison(prev => {
        if (prev.includes(scenarioId)) {
          return prev.filter(id => id !== scenarioId);
        } else {
          return [...prev, scenarioId];
        }
      });
    };

    const getScenarioProjections = (scenarioId) => {
      if (scenarioId === 'baseline') {
        return executiveData.projections;
      }
      const scenario = scenarios.find(s => s.id === scenarioId);
      return scenario?.projections || executiveData.projections;
    };

    const getScenarioName = (scenarioId) => {
      if (scenarioId === 'baseline') return 'Baseline';
      const scenario = scenarios.find(s => s.id === scenarioId);
      return scenario?.name || 'Unknown';
    };

    const availableScenarios = [
      { id: 'baseline', name: 'Baseline' },
      ...scenarios.filter(s => s.id !== 'working').map(s => ({ id: s.id, name: s.name }))
    ];

    return (
      <div className="space-y-6">
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

        {/* Scenario Comparison Section */}
        {availableScenarios.length > 1 && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-gray-800">Scenario Comparison</h5>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 text-sm"
              >
                {showComparison ? 'Hide Comparison' : 'Compare Scenarios'}
              </button>
            </div>

            {showComparison && (
              <div className="space-y-6">
                {/* Scenario Selection */}
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-3">Select Scenarios to Compare</h6>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableScenarios.map(scenario => (
                      <label key={scenario.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedScenariosForComparison.includes(scenario.id)}
                          onChange={() => toggleScenarioForComparison(scenario.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">{scenario.name}</span>
                      </label>
                    ))}
                  </div>
                  {selectedScenariosForComparison.length > 4 && (
                    <p className="text-xs text-orange-600 mt-2">
                      Note: Too many scenarios may make the chart difficult to read. Consider selecting fewer scenarios.
                    </p>
                  )}
                </div>

                {/* Occupation Filter */}
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-3">Select Occupations to View</h6>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleOccupation('All')}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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

                {/* Comparison Charts */}
                {selectedScenariosForComparison.length > 0 && (
                  <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6">
                      <h6 className="text-lg font-semibold mb-4">Workforce Gap Comparison</h6>
                      <ScenarioComparisonChart
                        scenarios={selectedScenariosForComparison.map(id => ({
                          id,
                          name: getScenarioName(id),
                          projections: getScenarioProjections(id)
                        }))}
                        selectedOccupations={getFilteredOccupations()}
                        chartType="gap"
                      />
                    </div>

                    <div className="bg-white border rounded-lg p-6">
                      <h6 className="text-lg font-semibold mb-4">Supply vs Demand Comparison</h6>
                      <ScenarioComparisonChart
                        scenarios={selectedScenariosForComparison.map(id => ({
                          id,
                          name: getScenarioName(id),
                          projections: getScenarioProjections(id)
                        }))}
                        selectedOccupations={getFilteredOccupations()}
                        chartType="supply-demand"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {scenarios.length > 0 && (
          <div className="border-t pt-6">
            <h5 className="font-medium text-gray-800 mb-3">Saved Scenarios ({scenarios.filter(s => s.id !== 'working').length})</h5>
            <div className="space-y-2">
              {scenarios.map(scenario => (
                <div key={scenario.id} className={`flex justify-between items-center p-3 rounded-lg ${
                  scenario.id === 'working' ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50'
                }`}>
                  <div className="flex-1">
                    <p className={`font-medium ${scenario.id === 'working' ? 'text-orange-800' : ''}`}>
                      {scenario.name}
                      {scenario.id === 'working' && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">APPLIED CHANGES</span>}
                    </p>
                    <p className={`text-sm ${scenario.id === 'working' ? 'text-orange-700' : 'text-gray-600'}`}>
                      {scenario.description || 'No description'}
                    </p>
                    <p className={`text-xs ${scenario.id === 'working' ? 'text-orange-600' : 'text-gray-500'}`}>
                      {scenario.id === 'working' ? (
                        <>Applied changes - save as scenario to keep permanently</>
                      ) : (
                        <>Created: {new Date(scenario.createdAt).toLocaleDateString()} | ID: {scenario.id.split('_')[2] || scenario.id.substr(-6)}</>
                      )}
                      {activeScenario === scenario.id && <span className="ml-2 text-blue-600 font-medium">(Active)</span>}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {scenario.id !== 'working' && (
                      <>
                        <button 
                          onClick={() => {
                            console.log('Loading scenario from button click:', scenario.id, scenario.name);
                            console.log('Current scenario parameters check:', scenario.parameters ? 'Has parameters' : 'Missing parameters');
                            onSelectScenario(scenario.id);
                          }}
                          className={`text-sm font-medium px-2 py-1 rounded ${
                            activeScenario === scenario.id 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'text-blue-600 hover:text-blue-800'
                          }`}
                          disabled={activeScenario === scenario.id}
                        >
                          {activeScenario === scenario.id ? 'Active' : 'Load'}
                        </button>
                        <button 
                          onClick={() => exportScenarioToExcel(scenario.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded"
                          title="Export this scenario to Excel"
                        >
                          Export
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the scenario "${scenario.name}"?`)) {
                              const updatedScenarios = scenarios.filter(s => s.id !== scenario.id);
                              setScenarios(updatedScenarios);
                              if (activeScenario === scenario.id) {
                                setActiveScenario('baseline');
                                setEditingParameters(JSON.parse(JSON.stringify(workforceData.baselineParameters)));
                                setUnsavedChanges(false);
                                setPendingChanges({});
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {scenario.id === 'working' && (
                      <>
                        <button 
                          onClick={onCreateScenario}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Save as Scenario
                        </button>
                        <button 
                          onClick={() => exportScenarioToExcel(scenario.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded"
                          title="Export working changes to Excel"
                        >
                          Export
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to discard the applied changes?')) {
                              onSelectScenario('baseline');
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded"
                        >
                          Discard
                        </button>
                      </>
                    )}
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
              height={50}
              iconType="line"
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px',
                lineHeight: '1.2'
              }}
              iconSize={14}
              formatter={(value) => {
                // Truncate long occupation names for legend display
                if (value.length > 20) {
                  return value.substring(0, 18) + '...';
                }
                return value;
              }}
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

  const DetailedSupplyDemandChart = ({ data, selectedOccupations }) => {
    const years = Object.keys(data).sort();
    const chartData = years.map(year => {
      const yearData = { year };

      // Calculate supply and demand for each selected occupation
      selectedOccupations.forEach(occ => {
        const occData = data[year][occ] || { supply: 0, demand: 0 };
        yearData[`${occ}_supply`] = occData.supply;
        yearData[`${occ}_demand`] = occData.demand;
        yearData[`${occ}_gap`] = occData.demand - occData.supply;
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
        // Group payload by occupation
        const occupationData = {};
        payload.forEach(entry => {
          const [occupation, type] = entry.dataKey.split('_');
          if (!occupationData[occupation]) {
            occupationData[occupation] = {};
          }
          occupationData[occupation][type] = entry.value;
        });

        return (
          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-sm">
            <p className="font-semibold text-gray-800 mb-2">{`Year: ${label}`}</p>
            {Object.entries(occupationData).map(([occupation, data]) => (
              <div key={occupation} className="mb-2 last:mb-0">
                <p className="text-sm font-medium text-gray-700 break-words">{occupation}</p>
                <div className="ml-2 space-y-1">
                  {data.supply !== undefined && (
                    <p className="text-xs" style={{ color: colors[occupation] }}>
                      Supply: {data.supply.toLocaleString()} FTE
                    </p>
                  )}
                  {data.demand !== undefined && (
                    <p className="text-xs" style={{ color: colors[occupation] }}>
                      Demand: {data.demand.toLocaleString()} FTE
                    </p>
                  )}
                  {data.gap !== undefined && (
                    <p className={`text-xs font-medium ${data.gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      Gap: {data.gap > 0 ? '+' : ''}{data.gap.toLocaleString()} FTE
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              {selectedOccupations.map(occ => [
                <linearGradient key={`supply-gradient-${occ}`} id={`supply-gradient-${occ}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[occ] || '#6B7280'} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors[occ] || '#6B7280'} stopOpacity={0.1}/>
                </linearGradient>,
                <linearGradient key={`demand-gradient-${occ}`} id={`demand-gradient-${occ}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[occ] || '#6B7280'} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={colors[occ] || '#6B7280'} stopOpacity={0.05}/>
                </linearGradient>
              ]).flat()}
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
              label={{ value: 'Workforce (FTE)', angle: -90, position: 'insideLeft', style: { fill: '#4B5563' } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={80}
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px',
                lineHeight: '1.2'
              }}
              iconSize={14}
              formatter={(value, entry) => {
                // Extract occupation name from the dataKey (remove _supply or _demand suffix)
                const occupation = value.replace(/_supply|_demand/, '');
                return occupation;
              }}
              content={(props) => {
                const { payload } = props;
                if (!payload || !payload.length) return null;

                // Group by occupation and get unique occupations
                const occupations = [...new Set(payload.map(item => 
                  item.dataKey.replace(/_supply|_demand/, '')
                ))];

                return (
                  <div className="flex flex-col items-center space-y-2 mt-4">
                    {/* Occupation colors */}
                    <div className="flex flex-wrap justify-center gap-3">
                      {occupations.map(occ => (
                        <div key={occ} className="flex items-center space-x-1">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: colors[occ] || '#6B7280' }}
                          ></div>
                          <span className="text-xs">
                            {occ}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Line type legend */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-0.5 bg-gray-600"></div>
                        <span className="text-xs">Solid Line = Supply</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-4 h-0.5 bg-gray-600" 
                          style={{ 
                            backgroundImage: 'repeating-linear-gradient(to right, #6B7280 0, #6B7280 4px, transparent 4px, transparent 8px)' 
                          }}
                        ></div>
                        <span className="text-xs">Dashed Line = Demand</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            {selectedOccupations.map(occ => [
              <Line
                key={`${occ}_supply`}
                type="monotone"
                dataKey={`${occ}_supply`}
                stroke={colors[occ] || '#6B7280'}
                strokeWidth={3}
                strokeDasharray="0"
                name={`${occ} Supply`}
                dot={{ fill: colors[occ] || '#6B7280', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />,
              <Line
                key={`${occ}_demand`}
                type="monotone"
                dataKey={`${occ}_demand`}
                stroke={colors[occ] || '#6B7280'}
                strokeWidth={3}
                strokeDasharray="8 4"
                name={`${occ} Demand`}
                dot={{ fill: colors[occ] || '#6B7280', strokeWidth: 2, r: 4, strokeDasharray: "0" }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            ]).flat()}
          </LineChart>
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

  const ScenarioComparisonChart = ({ scenarios, selectedOccupations, chartType }) => {
    if (!scenarios || scenarios.length === 0) {
      return <div className="text-gray-500 text-center py-8">No scenarios selected for comparison</div>;
    }

    const years = Object.keys(scenarios[0].projections).sort();

    if (chartType === 'gap') {
      // Gap comparison chart
      const chartData = years.map(year => {
        const yearData = { year };

        selectedOccupations.forEach(occ => {
          scenarios.forEach(scenario => {
            const scenarioData = scenario.projections[year][occ];
            const key = `${scenario.name}_${occ}`;
            yearData[key] = scenarioData?.gap || 0;
          });
        });

        return yearData;
      });

      const colors = [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ];

      const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-sm">
              <p className="font-semibold text-gray-800 mb-2">{`Year: ${label}`}</p>
              {payload.map((entry, index) => {
                const [scenarioName, occupation] = entry.dataKey.split('_');
                return (
                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {`${scenarioName} - ${occupation}: ${entry.value.toLocaleString()} FTE gap`}
                  </p>
                );
              })}
            </div>
          );
        }
        return null;
      };

      return (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                height={60}
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}
                iconSize={14}
              />
              {scenarios.map((scenario, scenarioIndex) =>
                selectedOccupations.map((occ, occIndex) => (
                  <Line
                    key={`${scenario.id}_${occ}`}
                    type="monotone"
                    dataKey={`${scenario.name}_${occ}`}
                    stroke={colors[(scenarioIndex * selectedOccupations.length + occIndex) % colors.length]}
                    strokeWidth={2}
                    strokeDasharray={scenario.name === 'Baseline' ? '0' : '5 5'}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name={`${scenario.name} - ${occ}`}
                  />
                ))
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    } else if (chartType === 'supply-demand') {
      // Supply vs Demand comparison
      const chartData = years.map(year => {
        const yearData = { year };

        scenarios.forEach(scenario => {
          const totalSupply = selectedOccupations.reduce((sum, occ) => {
            return sum + (scenario.projections[year][occ]?.supply || 0);
          }, 0);

          const totalDemand = selectedOccupations.reduce((sum, occ) => {
            return sum + (scenario.projections[year][occ]?.demand || 0);
          }, 0);

          yearData[`${scenario.name}_supply`] = totalSupply;
          yearData[`${scenario.name}_demand`] = totalDemand;
        });

        return yearData;
      });

      const colors = {
        supply: '#10B981',
        demand: '#EF4444'
      };

      const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-sm">
              <p className="font-semibold text-gray-800 mb-2">{`Year: ${label}`}</p>
              {payload.map((entry, index) => {
                const [scenarioName, type] = entry.dataKey.split('_');
                return (
                  <p key={index} className="text-sm" style={{ color: entry.color }}>
                    {`${scenarioName} ${type}: ${entry.value.toLocaleString()} FTE`}
                  </p>
                );
              })}
            </div>
          );
        }
        return null;
      };

      return (
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="year" 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis 
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                label={{ value: 'Total Workforce (FTE)', angle: -90, position: 'insideLeft', style: { fill: '#4B5563' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={60}
                wrapperStyle={{ 
                  paddingTop: '20px',
                  fontSize: '12px',
                  lineHeight: '1.2'
                }}
                iconSize={14}
              />
              {scenarios.map(scenario => [
                <Line
                  key={`${scenario.id}_supply`}
                  type="monotone"
                  dataKey={`${scenario.name}_supply`}
                  stroke={colors.supply}
                  strokeWidth={2}
                  strokeDasharray={scenario.name === 'Baseline' ? '0' : '5 5'}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name={`${scenario.name} Supply`}
                />,
                <Line
                  key={`${scenario.id}_demand`}
                  type="monotone"
                  dataKey={`${scenario.name}_demand`}
                  stroke={colors.demand}
                  strokeWidth={2}
                  strokeDasharray={scenario.name === 'Baseline' ? '0' : '8 4'}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name={`${scenario.name} Demand`}
                />
              ]).flat()}
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    return null;
  };

  const DataImportModal = () => {
    const [selectedFile, setSelectedFile] = React.useState(null);
    const [dataType, setDataType] = React.useState('baseline');
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleFileSelect = (e) => {
      const file = e.target.files[0];
      if (file && file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadStatus(null);
      } else {
        setUploadStatus({ type: 'error', message: 'Please select a CSV file' });
        setSelectedFile(null);
      }
    };

    const handleImport = async () => {
      if (!selectedFile) {
        setUploadStatus({ type: 'error', message: 'Please select a file first' });
        return;
      }

      setIsProcessing(true);
      setUploadStatus({ type: 'info', message: 'Processing file...' });

      try {
        const fileContent = await selectedFile.text();

        if (dataType === 'baseline') {
          // Process baseline population projections
          const csvData = parseCSV(fileContent);

          // Validate required columns
          const requiredColumns = ['Year', 'Gender', 'Age_Group', 'Projected_Population'];
          const hasRequiredColumns = requiredColumns.every(col => 
            csvData.length > 0 && csvData[0].hasOwnProperty(col)
          );

          if (!hasRequiredColumns) {
            throw new Error(`CSV must contain columns: ${requiredColumns.join(', ')}`);
          }

          // Process population data into growth rates
          const populationGrowth = processPopulationData(csvData);

          if (!populationGrowth) {
            throw new Error('Failed to process population data');
          }

          // Generate complete parameter set from uploaded data
          const newBaselineParameters = generateParametersFromUploadedData(populationGrowth);

          // Update the app state with new baseline data
          setWorkforceData(prev => ({
            ...prev,
            baselineParameters: newBaselineParameters,
            scenarios: {
              baseline: {
                name: 'Baseline',
                parameters: JSON.parse(JSON.stringify(newBaselineParameters))
              }
            },
            dataVersion: prev.dataVersion + 1 // Increment to force re-renders
          }));

          // Update executive data with new projections
          const newProjections = generateSampleProjections(newBaselineParameters);
          setExecutiveData({
            projections: newProjections,
            parameters: newBaselineParameters
          });

          // Reset editing parameters to use new baseline
          setEditingParameters(JSON.parse(JSON.stringify(newBaselineParameters)));

          // Clear any existing scenarios and reset state
          setScenarios([]);
          setActiveScenario('baseline');
          setUnsavedChanges(false);
          setPendingChanges({});
          setVisualizationsNeedUpdate(false);
          setLastAppliedProjections(null);
          setIsUsingUploadedData(true);

          setUploadStatus({ 
            type: 'success', 
            message: `Successfully imported baseline data with ${csvData.length} population records` 
          });

          console.log('Data import successful:', {
            recordCount: csvData.length,
            years: Object.keys(populationGrowth).length,
            sampleGrowthRates: populationGrowth[2024]
          });

        } else {
          throw new Error('Only baseline population data import is currently supported');
        }

      } catch (error) {
        console.error('Import error:', error);
        setUploadStatus({ 
          type: 'error', 
          message: `Import failed: ${error.message}` 
        });
      } finally {
        setIsProcessing(false);
      }
    };

    const handleClose = () => {
      setShowDataImport(false);
      setSelectedFile(null);
      setDataType('baseline');
      setIsProcessing(false);
      setUploadStatus(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Import Baseline Data</h3>

          {/* Status Messages */}
          {uploadStatus && (
            <div className={`mb-4 p-3 rounded-lg ${
              uploadStatus.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              uploadStatus.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {uploadStatus.message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
              <select 
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isProcessing}
              >
                <option value="baseline">Baseline Population Projections</option>
                <option value="supply" disabled>Workforce Supply Data (Coming Soon)</option>
                <option value="demand" disabled>Service Utilization Data (Coming Soon)</option>
                <option value="health" disabled>Health Status Data (Coming Soon)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Upload</label>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileSelect}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={isProcessing}
              />
              {selectedFile && (
                <p className="text-xs text-gray-600 mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* File Format Requirements */}
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Required CSV Format:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Columns:</strong> Year, Gender, Age_Group, Projected_Population</p>
                <p><strong>Gender:</strong> Male, Female</p>
                <p><strong>Age_Group:</strong> 0-18, 19-64, 65-84, 85+</p>
                <p><strong>Years:</strong> 2024-2034 (11 years)</p>
                <p><strong>Example:</strong> 2024,Female,0-18,80620</p>
              </div>
            </div>

            {/* Data Impact Information */}
            <div className="bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">What happens when you import:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Population growth rates calculated from your projections</li>
                <li>• Workforce supply parameters derived from population ratios</li>
                <li>• Health status and service utilization parameters adjusted</li>
                <li>• All existing scenarios will be cleared</li>
                <li>• New baseline will be used for all calculations</li>
              </ul>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={handleClose}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 disabled:opacity-50"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={!selectedFile || isProcessing}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">Multi-Professional Needs-Based Analytics Dashboard</p>
                {isUsingUploadedData && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Using Uploaded Baseline Data
                  </span>
                )}
                {!isUsingUploadedData && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Using Sample Data
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowDataImport(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {isUsingUploadedData ? 'Replace Data' : 'Import Data'}
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
              Scenario Builder
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