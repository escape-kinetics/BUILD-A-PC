import React, { useState, useEffect } from 'react';
import apiService from '../apiService';
import { Link } from 'react-router-dom';
import './Table.css';

function SavedBuildsPage() {
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadBuilds();
    }, []);

    const loadBuilds = async () => {
        setLoading(true);
        try {
            const response = await apiService.getAllBuildDetails();
            
            // Fetch all parts data in parallel
            const [cpus, gpus, mobos, rams, psus, cases, ssds, displays] = await Promise.all([
                apiService.fetchTable('cpus'),
                apiService.fetchTable('gpus'),
                apiService.fetchTable('motherboards'),
                apiService.fetchTable('ram'),
                apiService.fetchTable('psus'),
                apiService.fetchTable('cases'),
                apiService.fetchTable('ssds'),
                apiService.fetchTable('displays')
            ]).then(responses => responses.map(r => r.data.data || []));

            console.log('Parts data loaded:', { 
                cpus: cpus.length, 
                gpus: gpus.length,
                mobos: mobos.length,
                rams: rams.length,
                psus: psus.length,
                cases: cases.length,
                ssds: ssds.length,
                displays: displays.length
            });

            const findPrice = (list, name) => {
                const item = list.find(item => item.name === name);
                const priceUSD = parseFloat(item?.price || 0);
                return isNaN(priceUSD) ? 0 : Math.round(priceUSD * 83);
            };

            const buildsWithPrices = response.data.builds.map(build => {
                const prices = {
                    cpu: build.cpu ? findPrice(cpus, build.cpu) : 0,
                    gpu: build.gpu ? findPrice(gpus, build.gpu) : 0,
                    motherboard: build.motherboard ? findPrice(mobos, build.motherboard) : 0,
                    ram: build.ram ? findPrice(rams, build.ram) : 0,
                    psu: build.psu ? findPrice(psus, build.psu) : 0,
                    case: build.case_name ? findPrice(cases, build.case_name) : 0,
                    ssd: build.ssd_name ? findPrice(ssds, build.ssd_name) : 0,
                    display: build.display_name ? findPrice(displays, build.display_name) : 0
                };

                console.log(`Build ${build.build_id} (${build.build_name}) prices:`, prices);
                
                return {
                    ...build,
                    prices
                };
            });
            
            console.log('Builds with prices:', buildsWithPrices);
            setBuilds(buildsWithPrices);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch builds", err);
            setError('Failed to fetch builds.');
            setLoading(false);
        }
    };

    const fetchPartPrice = async (category, partName) => {
        if (!partName) return 0;
        try {
            const response = await apiService.fetchTable(category);
            const part = response.data.data?.find(p => p.name === partName);
            // Convert USD to INR (approximately ₹83 per USD as of Nov 2023)
            const priceUSD = part?.price || 0;
            const priceINR = Math.round(priceUSD * 83);
            console.log(`Price for ${partName}: $${priceUSD} = ₹${priceINR}`); // Debug log
            return priceINR;
        } catch (error) {
            console.error(`Failed to fetch price for ${partName}:`, error);
            return 0;
        }
    };

    const handleDelete = (buildId) => {
        if (!window.confirm(`Are you sure you want to delete build ${buildId}?`)) {
            return;
        }

        apiService.deleteBuild(buildId)
            .then(() => {
                // Filter out the deleted build from state
                setBuilds(currentBuilds => currentBuilds.filter(b => b.build_id !== buildId));
            })
            .catch(err => {
                console.error("Failed to delete build", err);
                alert("Error deleting build.");
            });
    };

    if (loading) return <div>Loading your builds...</div>;
    if (error) return <div style={{color: 'red'}}>{error}</div>;

    return (
        <div className="saved-builds-page">
            <div className="page-header">
                <h2>My Saved Builds</h2>
                <Link to="/builder" className="create-build-btn">Create New Build</Link>
            </div>
            
            {builds.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't saved any builds yet.</p>
                    <Link to="/builder" className="create-build-btn">Create Your First Build</Link>
                </div>
            ) : (
                <div className="builds-table-container">
                    <table className="builds-table">
                        <thead>
                            <tr>
                                <th>Build Name</th>
                                <th>CPU</th>
                                <th>GPU</th>
                                <th>Motherboard</th>
                                <th>RAM</th>
                                <th>PSU</th>
                                <th>Case</th>
                                <th>SSD</th>
                                <th>Display</th>
                                <th>Total Value</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {builds.map(build => {
                                // Get the parts data from the build
                                const totalValue = Object.values(build.prices || {}).reduce((sum, price) => sum + (price || 0), 0);

                                return (
                                    <tr key={build.build_id}>
                                        <td>{build.build_name}</td>
                                        <td>{build.cpu || '-'}</td>
                                        <td>{build.gpu || '-'}</td>
                                        <td>{build.motherboard || '-'}</td>
                                        <td>{build.ram || '-'}</td>
                                        <td>{build.psu || '-'}</td>
                                        <td>{build.case_name || '-'}</td>
                                        <td>{build.ssd_name || '-'}</td>
                                        <td>{build.display_name || '-'}</td>
                                        <td>
                                            <span className="price-badge">
                                                ₹{totalValue > 0 ? totalValue.toLocaleString('en-IN') : '0'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/builder/${build.build_id}`} className="edit-btn">
                                                    Edit
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(build.build_id)} 
                                                    className="delete-btn"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default SavedBuildsPage;
