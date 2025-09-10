// Additional JavaScript for QID157 - Assessment Summary
// Add this AFTER the existing QID157 script

Qualtrics.SurveyEngine.addOnload(function() {
    var questionContainer = this.getQuestionContainer();
    
    // Create assessment summary HTML
    var summaryHTML = `
        <div id="assessmentSummary-157" style="margin: 20px 0 30px 0; padding: 20px; background: #fff; border: 2px solid #a32035; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
            <h3 style="color: #a32035; margin-top: 0; margin-bottom: 15px; font-size: 18px;">Your Assessment Summary</h3>
            <div id="narrative-157" style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; padding: 12px; background-color: #f0f8ff; border-left: 4px solid #a32035; color: #333;">
                Enter your probabilities above to see your assessment summary.
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <h4 style="color: #a32035; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Cumulative Probabilities (at least this severe)</h4>
                    <div id="cumulative-157" style="font-size: 14px; line-height: 1.6; color: #333;">
                        No data entered yet
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #a32035; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Individual Level Probabilities (your allocation)</h4>
                    <div id="individual-157" style="font-size: 14px; line-height: 1.6; color: #333;">
                        No data entered yet
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Find the existing visualization container and add summary below it
    function insertSummary() {
        var vizContainer = document.getElementById('probVizContainer-157');
        var existingSummary = document.getElementById('assessmentSummary-157');
        
        console.log('QID157 Summary: Looking for viz container...', vizContainer ? 'FOUND' : 'NOT FOUND');
        console.log('QID157 Summary: Existing summary...', existingSummary ? 'FOUND' : 'NOT FOUND');
        
        if (existingSummary) {
            console.log('QID157 Summary: Summary already exists, forcing update');
            updateAssessmentSummary();
            return;
        }
        
        if (vizContainer) {
            console.log('QID157 Summary: Inserting summary HTML after viz container');
            vizContainer.insertAdjacentHTML('afterend', summaryHTML);
        } else {
            console.log('QID157 Summary: Using fallback insertion in question container');
            questionContainer.insertAdjacentHTML('beforeend', summaryHTML);
        }
        
        // Verify insertion worked
        setTimeout(function() {
            var insertedSummary = document.getElementById('assessmentSummary-157');
            var narrativeDiv = document.getElementById('narrative-157');
            var cumulativeDiv = document.getElementById('cumulative-157');
            var individualDiv = document.getElementById('individual-157');
            
            console.log('QID157 Summary: Post-insertion check...');
            console.log('  - Summary container:', insertedSummary ? 'FOUND' : 'NOT FOUND');
            console.log('  - Narrative div:', narrativeDiv ? 'FOUND' : 'NOT FOUND');
            console.log('  - Cumulative div:', cumulativeDiv ? 'FOUND' : 'NOT FOUND');
            console.log('  - Individual div:', individualDiv ? 'FOUND' : 'NOT FOUND');
            
            if (insertedSummary && narrativeDiv && cumulativeDiv && individualDiv) {
                console.log('QID157 Summary: All elements found, forcing update');
                updateAssessmentSummary();
            } else {
                console.log('QID157 Summary: Missing elements, will retry in 1 second');
                setTimeout(insertSummary, 1000);
            }
        }, 200);
    }
    
    // Try multiple times with different delays
    setTimeout(insertSummary, 1500);
    setTimeout(insertSummary, 3000);
    setTimeout(insertSummary, 5000);
    
    // Function to get current values with enhanced detection and debugging
    function getCurrentValues() {
        var values = [];
        var total = 0;
        
        console.log('QID157 Summary: Detecting values...');
        
        // Method 1: Try slider tracks
        var sliderTracks = questionContainer.querySelectorAll('.slider-track');
        console.log('QID157 Summary: Found', sliderTracks.length, 'slider tracks');
        
        if (sliderTracks.length >= 5) {
            sliderTracks.forEach(function(track, index) {
                if (index < 5) {
                    var handle = track.querySelector('.slider-handle');
                    if (handle) {
                        var value = parseFloat(handle.getAttribute('aria-valuenow')) || 0;
                        values.push(value);
                        total += value;
                        console.log('QID157 Summary: Slider', index, '=', value);
                    }
                }
            });
        }
        
        // Method 2: Try text inputs if sliders didn't work
        if (values.length === 0) {
            var allInputs = questionContainer.querySelectorAll('input[type="text"]');
            console.log('QID157 Summary: Found', allInputs.length, 'text inputs');
            
            for (var i = 0; i < Math.min(allInputs.length, 5); i++) {
                var input = allInputs[i];
                if (input && !input.readOnly && !input.id.toLowerCase().includes('total')) {
                    var val = parseFloat(input.value) || 0;
                    values.push(val);
                    total += val;
                    console.log('QID157 Summary: Input', i, '=', val, 'from', input.id);
                }
            }
        }
        
        // Method 3: More aggressive search
        if (values.length === 0) {
            var allInputs = questionContainer.querySelectorAll('input');
            console.log('QID157 Summary: Found', allInputs.length, 'total inputs');
            var count = 0;
            
            for (var i = 0; i < allInputs.length && count < 5; i++) {
                var input = allInputs[i];
                if (input.type === 'text' || input.type === 'number') {
                    var val = parseFloat(input.value) || 0;
                    values.push(val);
                    total += val;
                    count++;
                    console.log('QID157 Summary: Method 3 - Input', count, '=', val, 'from', input.id);
                }
            }
        }
        
        // Ensure we have exactly 5 values
        while (values.length < 5) {
            values.push(0);
        }
        
        console.log('QID157 Summary: Final values:', values, 'Total:', total);
        return { values: values.slice(0, 5), total: total };
    }
    
    // Function to update assessment summary
    function updateAssessmentSummary() {
        console.log('QID157 Summary: updateAssessmentSummary called');
        
        var data = getCurrentValues();
        var values = data.values;
        var total = data.total;
        
        console.log('QID157 Summary: Got data - values:', values, 'total:', total);
        
        var narrativeDiv = document.getElementById('narrative-157');
        var cumulativeDiv = document.getElementById('cumulative-157');
        var individualDiv = document.getElementById('individual-157');
        
        console.log('QID157 Summary: Elements found:');
        console.log('  - narrativeDiv:', narrativeDiv ? 'FOUND' : 'NOT FOUND');
        console.log('  - cumulativeDiv:', cumulativeDiv ? 'FOUND' : 'NOT FOUND');
        console.log('  - individualDiv:', individualDiv ? 'FOUND' : 'NOT FOUND');
        
        if (!narrativeDiv || !cumulativeDiv || !individualDiv) {
            console.log('QID157 Summary: Missing required elements, exiting');
            return;
        }
        
        if (total < 1) {
            console.log('QID157 Summary: Total < 1, showing default message');
            narrativeDiv.innerHTML = 'Enter your probabilities above to see your assessment summary.';
            cumulativeDiv.innerHTML = 'No data entered yet';
            individualDiv.innerHTML = 'No data entered yet';
            return;
        }
        
        console.log('QID157 Summary: Processing values for display...');
        
        var labels = ['no harmful impacts', 'minor impacts', 'limited impacts', 'moderate impacts', 'significant impacts', 'catastrophic impacts'];
        var [noHarm, minor, limited, moderate, significant, catastrophic] = values;
        
        // Calculate cumulative probabilities (from most severe upward)
        var cumCatastrophic = catastrophic;
        var cumSignificant = significant + catastrophic;
        var cumModerate = moderate + significant + catastrophic;
        var cumLimited = limited + moderate + significant + catastrophic;
        var cumMinor = minor + limited + moderate + significant + catastrophic;
        
        // Find highest individual probability
        var maxValue = Math.max(...values);
        var maxIndex = values.indexOf(maxValue);
        var mostLikely = labels[maxIndex];
        
        // Generate narrative
        var narrative = '';
        var totalNum = Number(total) || 0;
        var maxValueNum = Number(maxValue) || 0;
        var cumModerateNum = Number(cumModerate) || 0;
        
        if (Math.abs(totalNum - 100) > 1) {
            narrative = `<span style="color: #d32f2f;">Please ensure your probabilities total 100%. Current total: ${totalNum.toFixed(1)}%</span>`;
        } else {
            narrative = `Based on your assessment, this risk is most likely to result in <strong>${mostLikely}</strong> (${maxValueNum.toFixed(0)}% chance). `;
            
            if (cumModerateNum > 0) {
                narrative += `You think there's a <strong>${cumModerateNum.toFixed(0)}% chance</strong> this risk will cause moderate impacts or worse.`;
            }
        }
        
        // Update narrative
        console.log('QID157 Summary: Setting narrative:', narrative);
        narrativeDiv.innerHTML = narrative;
        
        // Update cumulative probabilities - show ALL
        var cumulativeHTML = '';
        cumulativeHTML += `<div><strong>${(Number(cumMinor) || 0).toFixed(0)}%</strong> chance of minor impacts or worse</div>`;
        cumulativeHTML += `<div><strong>${(Number(cumLimited) || 0).toFixed(0)}%</strong> chance of limited impacts or worse</div>`;
        cumulativeHTML += `<div><strong>${(Number(cumModerate) || 0).toFixed(0)}%</strong> chance of moderate impacts or worse</div>`;
        cumulativeHTML += `<div><strong>${(Number(cumSignificant) || 0).toFixed(0)}%</strong> chance of significant impacts or worse</div>`;
        cumulativeHTML += `<div><strong>${(Number(cumCatastrophic) || 0).toFixed(0)}%</strong> chance of catastrophic impacts</div>`;
        
        console.log('QID157 Summary: Setting cumulative HTML:', cumulativeHTML);
        cumulativeDiv.innerHTML = cumulativeHTML;
        
        // Update individual probabilities - show ALL including zeros
        var individualHTML = '';
        values.forEach(function(value, index) {
            var numValue = Number(value) || 0;
            individualHTML += `<div><strong>${numValue.toFixed(0)}%</strong> ${labels[index]}</div>`;
        });
        
        console.log('QID157 Summary: Setting individual HTML:', individualHTML);
        individualDiv.innerHTML = individualHTML;
        
        console.log('QID157 Summary: Update complete!');
    }
    
    // Set up polling to update summary
    setInterval(function() {
        updateAssessmentSummary();
    }, 500);
    
    // Initial update
    setTimeout(updateAssessmentSummary, 2000);
});