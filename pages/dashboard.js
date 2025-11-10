import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, 
    TrendingDown, 
    Activity, 
    Leaf, 
    AlertTriangle,
    Calendar,
    Filter,
    ChevronDown,
    Download
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '@/components/Navbar';

// Mapping strings to icons for rendering in the stats cards
const iconMap = {
    Activity: Activity,
    AlertTriangle: AlertTriangle,
    Leaf: Leaf,
    TrendingUp: TrendingUp
};

const Dashboard = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [timeRange, setTimeRange] = useState('30d');
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    
    // States for Live Data
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([]);
    const [categories, setCategories] = useState([]);
    const [diseaseTrendData, setDiseaseTrendData] = useState([]);
    const [diseaseDistribution, setDiseaseDistribution] = useState([]);
    const [severityData, setSeverityData] = useState([]);
    const [monthlyScans, setMonthlyScans] = useState([]);
    const [recentDiagnoses, setRecentDiagnoses] = useState([]);


    const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    const getStatColor = (color) => {
        const colors = {
            blue: 'bg-blue-100 text-blue-600',
            red: 'bg-red-100 text-red-600',
            green: 'bg-green-100 text-green-600',
            orange: 'bg-orange-100 text-orange-600'
        };
        return colors[color] || colors.blue;
    };


    const fetchDashboardData = async () => {
        setLoading(true);
        
        const query = new URLSearchParams({
            timeRange: timeRange,
            categoryId: selectedCategory
        }).toString();
        
        try {
            const res = await fetch(`/api/dashboard/data?${query}`); 
            if (!res.ok) {
                throw new Error('Failed to fetch dashboard data');
            }
            const data = await res.json();
            
            console.log("📊 API Response:", data);
            console.log("📁 Raw Categories from API:", data.categories);
            
            // Get total diagnoses count for "All Plants"
            const totalDiagnosesCount = parseInt(data.stats.find(s => s.title === 'Total Diagnoses')?.value || 0);
            
            // Create "All Plants" category
            const allPlantsCategory = { 
                id: 'all', 
                name: 'All Plants', 
                count: totalDiagnosesCount 
            };
            
            // Combine with API categories (which now won't include "all")
            const apiCategories = Array.isArray(data.categories) ? data.categories : [];
            const finalCategories = [allPlantsCategory, ...apiCategories];
            
            console.log("✅ Final Categories to Display:", finalCategories);
            
            // Set all fetched states
            setStats(data.stats || []);
            setCategories(finalCategories);
            setDiseaseTrendData(data.diseaseTrendData || []);
            setDiseaseDistribution(data.diseaseDistribution || []);
            setSeverityData(data.severityData || []);
            setMonthlyScans(data.monthlyScans || []);
            setRecentDiagnoses(data.recentDiagnoses || []);

        } catch (error) {
            console.error("❌ Error fetching dashboard data:", error);
            // Fallback for API failure
            setStats([]); 
            setCategories([{ id: 'all', name: 'All Plants', count: 0 }]); 
            setDiseaseTrendData([]);
            setDiseaseDistribution([]);
            setSeverityData([]);
            setMonthlyScans([]);
            setRecentDiagnoses([]);
        } finally {
            setLoading(false);
        }
    };

    // Effect to run the fetch function when filters change
    useEffect(() => {
        fetchDashboardData();
    }, [timeRange, selectedCategory]);


    // Helper to get the current category name for display
    const currentCategoryName = categories.find(c => c.id === selectedCategory)?.name || 'All Plants';
    const currentCategoryCount = categories.find(c => c.id === selectedCategory)?.count || 0;
    const totalDiagnoses = stats.find(s => s.title === 'Total Diagnoses')?.value || '0';
    const trendRangeText = 
        timeRange === '7d' ? 'Last 7 days' : 
        timeRange === '90d' ? 'Last 90 days' : 
        timeRange === '1y' ? 'Last Year' : 'Last 30 days';

    if (loading) {
        // Simple Loading state
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl font-medium text-gray-500 flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading Plant Insights...</span>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Overview of your plant health monitoring and disease tracking
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-8">
                    {/* Category Filter - UPDATED */}
                    <div className="relative">
                        <button
                            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <Filter className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">
                                {currentCategoryName}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {currentCategoryCount}
                            </span>
                            <ChevronDown 
                                className={`w-4 h-4 text-gray-600 transition-transform ${
                                    showCategoryDropdown ? 'rotate-180' : ''
                                }`} 
                            />
                        </button>

                        {showCategoryDropdown && (
                            <div className="absolute top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                                {categories.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                        No categories found
                                    </div>
                                ) : (
                                    <div className="py-1">
                                        {categories.map(category => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    setSelectedCategory(category.id);
                                                    setShowCategoryDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between group ${
                                                    selectedCategory === category.id ? 'bg-green-50' : ''
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Category Icon */}
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                                                        category.id === 'all' 
                                                            ? 'bg-blue-100 text-blue-600' 
                                                            : 'bg-green-100 text-green-600'
                                                    }`}>
                                                        {category.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    
                                                    {/* Category Details */}
                                                    <div>
                                                        <div className={`font-medium ${
                                                            selectedCategory === category.id 
                                                                ? 'text-green-700' 
                                                                : 'text-gray-800'
                                                        }`}>
                                                            {category.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {category.count} {category.count === 1 ? 'scan' : 'scans'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Selected Indicator */}
                                                {selectedCategory === category.id && (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Time Range Filter */}
                    <div className="flex space-x-2">
                        {['7d', '30d', '90d', '1y'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    timeRange === range
                                        ? 'bg-green-600 text-white'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {range === '7d' && 'Last 7 Days'}
                                {range === '30d' && 'Last 30 Days'}
                                {range === '90d' && 'Last 90 Days'}
                                {range === '1y' && 'Last Year'}
                            </button>
                        ))}
                    </div>

                    {/* Export Button */}
                    <button className="ml-auto flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Export</span>
                    </button>
                </div>

                {/* Selected Category Info Banner - NEW */}
                {selectedCategory !== 'all' && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <Leaf className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">
                                        Viewing: {currentCategoryName}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {currentCategoryCount} total {currentCategoryCount === 1 ? 'scan' : 'scans'} • {trendRangeText}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                            >
                                View All Plants →
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => {
                        const IconComponent = iconMap[stat.icon];
                        const changeText = stat.title === 'Total Diagnoses' ? `${Math.abs(stat.change)}%` : stat.change;
                        
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getStatColor(stat.color)}`}>
                                        {IconComponent && <IconComponent className="w-6 h-6" />}
                                    </div>
                                    {stat.change !== 0 && (
                                        <div className={`flex items-center space-x-1 text-sm font-medium ${
                                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {stat.trend === 'up' ? (
                                                <TrendingUp className="w-4 h-4" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4" />
                                            )}
                                            <span>{changeText}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                            </div>
                        )
                    })}
                </div>

                {/* Main Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Disease Trend Line Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Disease Trend</h2>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{trendRangeText}</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={diseaseTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value, name) => [name === 'diseased' || name === 'healthy' ? value.toString() : `${value}%`, name === 'diseased' ? 'Diseased' : name === 'healthy' ? 'Healthy' : 'Avg. Severity']}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="diseased" 
                                    stroke="#ef4444" 
                                    strokeWidth={3}
                                    name="Diseased Plants"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="healthy" 
                                    stroke="#22c55e" 
                                    strokeWidth={3}
                                    name="Healthy Plants"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="severity" 
                                    stroke="#3b82f6" 
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    name="Avg. Severity (%)"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Disease Distribution Pie Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Top Disease Distribution (from {totalDiagnoses} scans)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={diseaseDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {diseaseDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name, props) => [`${value} Scans (${props.payload.percentage}%)`, props.payload.name]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Second Row Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Severity Levels Bar Chart */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Disease Severity Levels</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={severityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="level" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => [`${value} Scans`, 'Count']}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Scans Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Scan Activity (Last 12 Months)</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={monthlyScans}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#fff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="scans" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Diagnoses</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Disease</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Severity</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDiagnoses.length > 0 ? (
                                    recentDiagnoses.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-800 font-medium">{item.disease}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full ${
                                                                item.severity > 50 ? 'bg-red-500' : item.severity > 15 ? 'bg-orange-500' : 'bg-green-500'
                                                            }`}
                                                            style={{ width: `${item.severity}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-gray-600 font-medium">{item.severity}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                                    item.status === 'Healthy' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'Active' ? 'bg-red-100 text-red-700' :
                                                    item.status === 'Treated' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertTriangle className="w-8 h-8 text-gray-400" />
                                                <p>No recent diagnoses found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;