import { useEffect, useState } from "react";
import { getPitches } from "../api/pitchApi";

const PitchList = () => {
    const [pitches, setPitches] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPitches = async () => {
            try {
                const response = await getPitches();
                setPitches(response.data);
            } catch (err) {
                setError("Failed to fetch pitches.");
            }
        };

        fetchPitches();
    }, []);

    return (
        <div>
            <h2>All Pitches</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {pitches.length > 0 ? (
                pitches.map((pitch) => (
                    <div key={pitch.id} className="pitch-card">
                        <h3>{pitch.title}</h3>
                        <p><strong>Company Location:</strong> {pitch.company_location}</p>
                        <p><strong>Country:</strong> {pitch.country}</p>
                        <p><strong>Industry:</strong> {pitch.industry}</p>
                        <p><strong>Stage:</strong> {pitch.stage}</p>
                        <p><strong>Investor Role:</strong> {pitch.ideal_investor_role}</p>
                        <p><strong>Raising Amount:</strong> ${pitch.total_raising_amount}</p>
                        <p><strong>Minimum Investment:</strong> ${pitch.minimum_investment}</p>
                        <p><strong>Business:</strong> {pitch.the_business}</p>
                        <p><strong>Market:</strong> {pitch.the_market}</p>
                        <p><strong>Progress:</strong> {pitch.progress}</p>
                        <p><strong>Objective:</strong> {pitch.objective}</p>
                    </div>
                ))
            ) : (
                <p>No pitches found.</p>
            )}
        </div>
    );
};

export default PitchList;
