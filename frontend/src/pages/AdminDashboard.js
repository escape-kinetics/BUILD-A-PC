import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../apiService';
import './AdminDashboard.css';

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [statistics, setStatistics] = useState({
        partCounts: [],
        highPowerBuilds: [],
        loading: true,
        error: null
    });
    const [popularity, setPopularity] = useState({});
    const [editItem, setEditItem] = useState(null);
    const [selectedTable, setSelectedTable] = useState('cpus');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    // Default fields per table used when creating a new item (fallback when table is empty)
    const DEFAULT_FIELDS = {
        cpus: ['name','manufacturer','price','tdp','socket','core_count','core_clock','boost_clock','microarchitecture'],
        gpus: ['name','manufacturer','price','tdp_w','memory_gb'],
        motherboards: ['name','manufacturer','price','size','socket','chipset','ram_slots','memory_type'],
        ram: ['name','manufacturer','price','size_gb','type','modules'],
        psus: ['name','manufacturer','price','watt','size'],
        cases: ['name','manufacturer','price','size'],
        ssds: ['name','manufacturer','price','size_gb','interface'],
        displays: ['name','manufacturer','price','size_inches','refresh_rate']
    };
    const NUMERIC_FIELDS = new Set(['price','tdp','tdp_w','memory_gb','core_count','core_clock','boost_clock','ram_slots','modules','watt','size_gb','size_inches','refresh_rate']);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStatistics();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            fetchTableData();
        }
    }, [selectedTable]);

    const fetchStatistics = async () => {
        try {
            const [partCountsRes, highPowerRes] = await Promise.all([
                apiService.getPartCounts(),
                apiService.getHighPowerBuilds()
            ]);

            // Also fetch all builds to compute popularity of parts chosen by users
            let buildsRes = { data: { builds: [] } };
            try {
                buildsRes = await apiService.getAllBuildDetails();
            } catch (err) {
                console.warn('Could not fetch builds for popularity:', err);
            }

            // Compute popularity counts by part name
            const counts = {
                cpu: {},
                gpu: {},
                motherboard: {},
                ram: {},
                psu: {},
                case: {},
                ssd: {},
                display: {}
            };
            const buildsList = buildsRes.data.builds || [];
            buildsList.forEach(b => {
                if (b.cpu) counts.cpu[b.cpu] = (counts.cpu[b.cpu] || 0) + 1;
                if (b.gpu) counts.gpu[b.gpu] = (counts.gpu[b.gpu] || 0) + 1;
                if (b.motherboard) counts.motherboard[b.motherboard] = (counts.motherboard[b.motherboard] || 0) + 1;
                if (b.ram) counts.ram[b.ram] = (counts.ram[b.ram] || 0) + 1;
                if (b.psu) counts.psu[b.psu] = (counts.psu[b.psu] || 0) + 1;
                if (b.case_name) counts.case[b.case_name] = (counts.case[b.case_name] || 0) + 1;
                if (b.ssd_name) counts.ssd[b.ssd_name] = (counts.ssd[b.ssd_name] || 0) + 1;
                if (b.display_name) counts.display[b.display_name] = (counts.display[b.display_name] || 0) + 1;
            });

            const toSortedArray = (obj) => Object.entries(obj).map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count);
            setPopularity({
                cpu: toSortedArray(counts.cpu),
                gpu: toSortedArray(counts.gpu),
                motherboard: toSortedArray(counts.motherboard),
                ram: toSortedArray(counts.ram),
                psu: toSortedArray(counts.psu),
                case: toSortedArray(counts.case),
                ssd: toSortedArray(counts.ssd),
                display: toSortedArray(counts.display),
            });

            setStatistics({
                partCounts: partCountsRes.data.part_counts,
                highPowerBuilds: highPowerRes.data.high_power_builds,
                loading: false,
                error: null
            });
        } catch (error) {
            setStatistics(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to load statistics'
            }));
        }
    };

    const fetchTableData = async () => {
        setLoading(true);
        try {
            // If viewing builds, use the dedicated endpoint which returns joined details
            if (selectedTable === 'builds') {
                const res = await apiService.getAllBuildDetails();
                // endpoint returns { builds: [...] }
                setTableData(res.data.builds || []);
            } else {
                // For parts tables use the generic fetch (paginated)
                const response = await apiService.fetchTable(selectedTable, 1, 500);
                setTableData(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch table data:', error);
            setTableData([]);
        }
        setLoading(false);
    };

    const handleUpdateAttribute = async (itemId, column, value) => {
        try {
            await apiService.adminUpdateAttribute(selectedTable, itemId, column, value);
            fetchTableData(); // Refresh the table
        } catch (error) {
            console.error('Failed to update attribute:', error);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            if (selectedTable === 'builds') {
                // Delete a build via the public endpoint
                await apiService.deleteBuild(itemId);
            } else {
                await apiService.adminDeleteItem(selectedTable, itemId);
            }
            fetchTableData(); // Refresh the table
        } catch (error) {
            console.error('Failed to delete item:', error);
            alert('Delete failed: ' + (error.response?.data?.detail || error.message));
        }
    };

    const handleCreateItem = async (newItem) => {
        try {
            await apiService.adminCreateItem(selectedTable, newItem);
            fetchTableData(); // Refresh the table
            setEditItem(null); // Close the edit form
        } catch (error) {
            console.error('Failed to create item:', error);
        }
    };

    const renderOverview = () => (
        <div className="overview-section">
            <div className="stats-grid">
                <div className="stats-card full-width">
                    <h3>Part Inventory & Price Statistics</h3>
                    <div className="part-inventory-table">
                        <table className="inventory-stats-table">
                            <thead>
                                <tr>
                                    <th>Category</th>
                                    <th>Total Parts</th>
                                    <th>Min Price</th>
                                    <th>Max Price</th>
                                    <th>Avg Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statistics.partCounts.map(count => (
                                    <tr key={count.category}>
                                        <td className="category-name">{count.category.toUpperCase()}</td>
                                        <td className="count-badge">{count.total_parts}</td>
                                        <td className="price-cell">₹{count.min_price ? (count.min_price * 88).toFixed(2) : 'N/A'}</td>
                                        <td className="price-cell">₹{count.max_price ? (count.max_price * 88).toFixed(2) : 'N/A'}</td>
                                        <td className="price-cell avg">₹{count.avg_price ? (count.avg_price * 88).toFixed(2) : 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="stats-card">
                    <h3>High Power Builds</h3>
                    <div className="high-power-list">
                        {statistics.highPowerBuilds.map(build => (
                            <div key={build.build_id} className="high-power-item">
                                <span>{build.build_name}</span>
                                <span className="power">{build.total_power_estimate}W</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="popularity-section">
                <h3>User Interest (Top Parts)</h3>
                <div className="popularity-grid">
                    {renderPopularityChart('cpu', 'CPUs')}
                    {renderPopularityChart('gpu', 'GPUs')}
                    {renderPopularityChart('ram', 'Memory')}
                    {renderPopularityChart('psu', 'PSUs')}
                    {renderPopularityChart('case', 'Cases')}
                </div>
            </div>
        </div>
    );

    const renderPopularityChart = (key, title) => {
        const data = popularity[key] || [];
        if (!data || data.length === 0) {
            return (
                <div className="popularity-card">
                    <h4>{title}</h4>
                    <div className="empty">No data</div>
                </div>
            );
        }

        const top = data.slice(0, 8);
        const max = top.length ? top[0].count : 1;

        return (
            <div className="popularity-card">
                <h4>{title}</h4>
                <ul className="pop-list">
                    {top.map(item => {
                        const pct = Math.round((item.count / max) * 100);
                        return (
                            <li key={item.name} className="pop-item">
                                <div className="pop-left">
                                    <span className="pop-name">{item.name}</span>
                                </div>
                                <div className="pop-bar-wrap">
                                    <div className="pop-bar" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="pop-count">{item.count}</div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    const renderManagement = () => (
        <div className="management-section">
            <div className="table-controls">
                <select 
                    value={selectedTable} 
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="table-select"
                >
                    <option value="cpus">CPUs</option>
                    <option value="gpus">GPUs</option>
                    <option value="motherboards">Motherboards</option>
                    <option value="ram">RAM</option>
                    <option value="psus">PSUs</option>
                    <option value="cases">Cases</option>
                    <option value="ssds">SSDs</option>
                    <option value="builds">Builds</option>
                    <option value="displays">Displays</option>
                </select>
                    <button 
                        onClick={() => {
                            // create new empty item using either a sample row or defaults
                            let newItem = {};
                            const sample = tableData && tableData[0];
                            if (sample) {
                                Object.keys(sample).forEach(k => {
                                    if (k === 'id' || k === 'build_id') return;
                                    newItem[k] = sample[k] === null ? '' : sample[k];
                                });
                            } else {
                                // use defaults for this table
                                const defs = DEFAULT_FIELDS[selectedTable] || ['name','manufacturer','price'];
                                defs.forEach(k => newItem[k] = '');
                            }
                            setEditItem(newItem);
                        }} 
                        className="add-button"
                    >
                        Add New Item
                    </button>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="table-container">
                    {selectedTable === 'builds' ? (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Build ID</th>
                                    <th>Name</th>
                                    <th>CPU</th>
                                    <th>GPU</th>
                                    <th>Motherboard</th>
                                    <th>RAM</th>
                                    <th>PSU</th>
                                    <th>Case</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map(item => (
                                    <tr key={item.build_id}>
                                        <td>{item.build_id}</td>
                                        <td>{item.build_name}</td>
                                        <td>{item.cpu || ''}</td>
                                        <td>{item.gpu || ''}</td>
                                        <td>{item.motherboard || ''}</td>
                                        <td>{item.ram || ''}</td>
                                        <td>{item.psu || ''}</td>
                                        <td>{item.case_name || ''}</td>
                                        <td>
                                            <button onClick={() => handleDeleteItem(item.build_id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    {(() => {
                                        switch(selectedTable) {
                                            case 'cpus':
                                                return (
                                                    <>
                                                        <th>Socket</th>
                                                        <th>Price</th>
                                                        <th>Core Count</th>
                                                        <th>Core Clock</th>
                                                        <th>Boost Clock</th>
                                                        <th>Microarchitecture</th>
                                                        <th>TDP</th>
                                                        <th>Graphics</th>
                                                    </>
                                                );
                                            case 'gpus':
                                                return (
                                                    <>
                                                        <th>Memory (GB)</th>
                                                        <th>TDP (W)</th>
                                                        <th>Price</th>
                                                    </>
                                                );
                                            case 'motherboards':
                                                return (
                                                    <>
                                                        <th>Size</th>
                                                        <th>Socket</th>
                                                        <th>Chipset</th>
                                                        <th>RAM Slots</th>
                                                        <th>Price</th>
                                                    </>
                                                );
                                            case 'ram':
                                                return (
                                                    <>
                                                        <th>Size (GB)</th>
                                                        <th>Type</th>
                                                        <th>Price</th>
                                                    </>
                                                );
                                            case 'psus':
                                                return (
                                                    <>
                                                        <th>Size</th>
                                                        <th>Wattage</th>
                                                        <th>Price</th>
                                                    </>
                                                );
                                            case 'cases':
                                                return (
                                                    <>
                                                        <th>Size</th>
                                                        <th>Price</th>
                                                    </>
                                                );
                                            case 'ssds':
                                                return (
                                                    <>
                                                        <th>Size (GB)</th>
                                                        <th>Bus</th>
                                                        <th>Format</th>
                                                        <th>Price</th>
                                                    </>
                                                );
                                            case 'displays':
                                                return (
                                                    <>
                                                        <th>Panel</th>
                                                        <th>Resolution</th>
                                                        <th>Refresh Rate</th>
                                                        <th>Price</th>
                                                    </>
                                                );
                                            default:
                                                return <th>Price</th>;
                                        }
                                    })()}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>
                                            <input 
                                                type="text" 
                                                value={item.name || ''} 
                                                onChange={(e) => handleUpdateAttribute(item.id, 'name', e.target.value)}
                                            />
                                        </td>
                                        {(() => {
                                            const renderField = (field, type = "text", options = {}) => (
                                                <td>
                                                    <input 
                                                        type={type}
                                                        value={item[field] || ''}
                                                        onChange={(e) => handleUpdateAttribute(item.id, field, e.target.value)}
                                                        {...options}
                                                    />
                                                </td>
                                            );

                                            switch(selectedTable) {
                                                case 'cpus':
                                                    return (
                                                        <>
                                                            {renderField("socket")}
                                                            {renderField("price", "number", {step: "0.01", min: 0})}
                                                            {renderField("core_count", "number", {min: 1})}
                                                            {renderField("core_clock", "number", {step: "0.1", min: 0})}
                                                            {renderField("boost_clock", "number", {step: "0.1", min: 0})}
                                                            {renderField("microarchitecture")}
                                                            {renderField("tdp", "number", {min: 0})}
                                                            {renderField("graphics")}
                                                        </>
                                                    );
                                                case 'gpus':
                                                    return (
                                                        <>
                                                            {renderField("memory_gb", "number", {min: 0})}
                                                            {renderField("tdp_w", "number", {min: 0})}
                                                            {renderField("price", "number", {step: "0.01", min: 0})}
                                                        </>
                                                    );
                                                case 'motherboards':
                                                    return (
                                                        <>
                                                            {renderField("size")}
                                                            {renderField("socket")}
                                                            {renderField("chipset")}
                                                            {renderField("ram_slots", "number", {min: 0})}
                                                            {renderField("price", "number", {step: "0.01", min: 0})}
                                                        </>
                                                    );
                                                case 'ram':
                                                    return (
                                                        <>
                                                            {renderField("size_gb", "number", {min: 1})}
                                                            {renderField("type")}
                                                            {renderField("price", "number", {step: "0.01", min: 0})}
                                                        </>
                                                    );
                                                case 'psus':
                                                    return (
                                                        <>
                                                            {renderField("size")}
                                                            {renderField("watt", "number", {min: 1})}
                                                            {renderField("price", "number", {step: "0.01", min: 0})}
                                                        </>
                                                    );
                                                case 'cases':
                                                    return (
                                                        <>
                                                            {renderField("size")}
                                                            {renderField("price", "number", {step: "0.01", min: 0})}
                                                        </>
                                                    );
                                                case 'ssds':
                                                    return (
                                                        <>
                                                            {renderField("size_gb", "number", {min: 1})}
                                                            {renderField("bus")}
                                                            {renderField("format_type")}
                                                            {renderField("price", "number", {step: "0.01", min: 0})}
                                                        </>
                                                    );
                                                case 'displays':
                                                    return (
                                                        <>
                                                            {renderField("panel")}
                                                            {renderField("resolution")}
                                                            {renderField("refresh_rate", "number", {min: 30})}
                                                            {renderField("price", "number", {step: "0.01", min: 0})}
                                                        </>
                                                    );
                                                default:
                                                    return renderField("price", "number", {step: "0.01", min: 0});
                                            }
                                        })()}
                                        <td>
                                            <button onClick={() => setEditItem(item)}>Edit</button>
                                            <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {editItem && (
                <div className="edit-modal">
                    <div className="edit-form">
                        <h3>{editItem.id ? 'Edit Item' : `Create New ${selectedTable.slice(0, -1).toUpperCase()}`}</h3>
                        
                        {(() => {
                            const renderField = (label, field, type = "text", options = {}) => (
                                <div className="form-row">
                                    <label>{label}:</label>
                                    <input
                                        type={type}
                                        value={editItem[field] || ''}
                                        onChange={(e) => setEditItem({
                                            ...editItem, 
                                            [field]: type === "number" ? Number(e.target.value) : e.target.value
                                        })}
                                        required
                                        {...options}
                                    />
                                </div>
                            );

                            switch (selectedTable) {
                                case 'cpus':
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Socket", "socket")}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                            {renderField("Core Count", "core_count", "number", {min: 1})}
                                            {renderField("Core Clock (GHz)", "core_clock", "number", {min: 0, step: "0.1"})}
                                            {renderField("Boost Clock (GHz)", "boost_clock", "number", {min: 0, step: "0.1"})}
                                            {renderField("Microarchitecture", "microarchitecture")}
                                            {renderField("TDP (Watts)", "tdp", "number", {min: 0})}
                                            {renderField("Graphics", "graphics")}
                                        </>
                                    );

                                case 'gpus':
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Memory (GB)", "memory_gb", "number", {min: 0})}
                                            {renderField("TDP (Watts)", "tdp_w", "number", {min: 0})}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                        </>
                                    );

                                case 'motherboards':
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Size", "size")}
                                            {renderField("Socket", "socket")}
                                            {renderField("Chipset", "chipset")}
                                            {renderField("RAM Slots", "ram_slots", "number", {min: 0})}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                        </>
                                    );

                                case 'ram':
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Size (GB)", "size_gb", "number", {min: 1})}
                                            {renderField("Type", "type")}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                        </>
                                    );

                                case 'psus':
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Size", "size")}
                                            {renderField("Wattage", "watt", "number", {min: 1})}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                        </>
                                    );

                                case 'cases':
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Size", "size")}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                        </>
                                    );

                                case 'ssds':
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Size (GB)", "size_gb", "number", {min: 1})}
                                            {renderField("Bus Interface", "bus")}
                                            {renderField("Format Type", "format_type")}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                        </>
                                    );

                                case 'displays':
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Panel Type", "panel")}
                                            {renderField("Resolution", "resolution")}
                                            {renderField("Refresh Rate (Hz)", "refresh_rate", "number", {min: 30})}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                        </>
                                    );

                                default:
                                    return (
                                        <>
                                            {renderField("Name", "name")}
                                            {renderField("Price (USD)", "price", "number", {min: 0, step: "0.01"})}
                                        </>
                                    );
                            }
                        })()}

                        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:16}}>
                            <button onClick={() => setEditItem(null)} style={{background:'#f44336',color:'white',padding:'8px 12px',border:'none',borderRadius:4}}>Cancel</button>
                            <button onClick={async ()=>{
                                try {
                                    let payload = {};
                                    switch(selectedTable) {
                                        case 'cpus':
                                            payload = {
                                                name: editItem.name,
                                                socket: editItem.socket,
                                                price: editItem.price,
                                                core_count: editItem.core_count,
                                                core_clock: editItem.core_clock,
                                                boost_clock: editItem.boost_clock,
                                                microarchitecture: editItem.microarchitecture,
                                                tdp: editItem.tdp,
                                                graphics: editItem.graphics
                                            };
                                            break;
                                        case 'gpus':
                                            payload = {
                                                name: editItem.name,
                                                memory_gb: editItem.memory_gb,
                                                tdp_w: editItem.tdp_w,
                                                price: editItem.price
                                            };
                                            break;
                                        case 'motherboards':
                                            payload = {
                                                name: editItem.name,
                                                size: editItem.size,
                                                socket: editItem.socket,
                                                chipset: editItem.chipset,
                                                ram_slots: editItem.ram_slots,
                                                price: editItem.price
                                            };
                                            break;
                                        case 'ram':
                                            payload = {
                                                name: editItem.name,
                                                size_gb: editItem.size_gb,
                                                type: editItem.type,
                                                price: editItem.price
                                            };
                                            break;
                                        case 'psus':
                                            payload = {
                                                name: editItem.name,
                                                size: editItem.size,
                                                watt: editItem.watt,
                                                price: editItem.price
                                            };
                                            break;
                                        case 'cases':
                                            payload = {
                                                name: editItem.name,
                                                size: editItem.size,
                                                price: editItem.price
                                            };
                                            break;
                                        case 'ssds':
                                            payload = {
                                                name: editItem.name,
                                                size_gb: editItem.size_gb,
                                                bus: editItem.bus,
                                                format_type: editItem.format_type,
                                                price: editItem.price
                                            };
                                            break;
                                        case 'displays':
                                            payload = {
                                                name: editItem.name,
                                                panel: editItem.panel,
                                                resolution: editItem.resolution,
                                                refresh_rate: editItem.refresh_rate,
                                                price: editItem.price
                                            };
                                            break;
                                        default:
                                            payload = {
                                                name: editItem.name,
                                                price: editItem.price
                                            };
                                    }

                                    // Convert numeric fields
                                    for (const key in payload) {
                                        if (NUMERIC_FIELDS.has(key) && payload[key] !== null && payload[key] !== undefined) {
                                            payload[key] = Number(payload[key]);
                                        }
                                    }

                                    if (editItem.id) {
                                        await apiService.adminUpdateItem(selectedTable, editItem.id, payload);
                                        alert(`${selectedTable.slice(0, -1).toUpperCase()} updated successfully`);
                                    } else {
                                        await apiService.adminCreateItem(selectedTable, payload);
                                        alert(`${selectedTable.slice(0, -1).toUpperCase()} created successfully`)
                                    }
                                    
                                    setEditItem(null);
                                    fetchTableData();
                                } catch (err) {
                                    console.error('Create/Update failed', err);
                                    alert('Operation failed: ' + (err.response?.data?.detail || err.message));
                                }
                            }} style={{background:'#4CAF50',color:'white',padding:'8px 12px',border:'none',borderRadius:4}}>
                                {editItem.id ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            
            <div className="dashboard-tabs">
                <button 
                    className={activeTab === 'overview' ? 'active' : ''} 
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={activeTab === 'management' ? 'active' : ''} 
                    onClick={() => setActiveTab('management')}
                >
                    Part Management
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'overview' ? renderOverview() : renderManagement()}
            </div>
        </div>
    );
}

export default AdminDashboard;
