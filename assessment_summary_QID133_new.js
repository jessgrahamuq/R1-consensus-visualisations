// Assessment Summary JavaScript for QID133
// Add this to your Qualtrics question JavaScript

Qualtrics.SurveyEngine.addOnload(function() {
    var questionContainer = this.getQuestionContainer();
    
    // Create assessment summary HTML
    var summaryHTML = `
        <div id="assessmentSummary-133" style="margin: 20px 0 30px 0; padding: 20px; background: #fff; border: 2px solid #4caf50; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-family: Arial, sans-serif;">
            <div style="background-color: #4caf50; color: white; padding: 8px 12px; margin: -20px -20px 15px -20px; border-radius: 6px 6px 0 0; font-weight: bold; font-size: 16px;">
                Your Assessment Summary
            </div>
            <div id="narrative-133" style="font-size: 16px; line-height: 1.4; margin-bottom: 20px; padding: 12px; background-color: #f0f8ff; border-left: 4px solid #4caf50; color: #333;">
                Enter your probabilities above to see your assessment summary.
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                <div>
                    <h4 style="color: #4caf50; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Cumulative Probabilities (at least this severe)</h4>
                    <div id="cumulative-133" style="font-size: 14px; line-height: 1.6; color: #333;">
                        No data entered yet
                    </div>
                </div>
                
                <div>
                    <h4 style="color: #4caf50; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Individual Level Probabilities (your allocation)</h4>
                    <div id="individual-133" style="font-size: 14px; line-height: 1.6; color: #333;">
                        No data entered yet
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert summary after the question content
    function insertSummary() {
        var existingSummary = document.getElementById('assessmentSummary-133');
        
        if (existingSummary) {
            updateAssessmentSummary();
            return;
        }
        
        // Insert at the end of the question container
        questionContainer.insertAdjacentHTML('beforeend', summaryHTML);
        
        // Verify insertion and update
        setTimeout(function() {
            updateAssessmentSummary();
        }, 300);
    }
    
    // Function to get current probability values from the question inputs
    function getCurrentValues() {
        var values = [];
        var total = 0;
        
        // Try different methods to get input values
        // Method 1: Look for text inputs in order
        var inputs = questionContainer.querySelectorAll('input[type="text"]');
        
        // Filter out total/sum inputs and get the first 5 probability inputs
        var probabilityInputs = [];
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (!input.readOnly && 
                !input.id.toLowerCase().includes('total') && 
                !input.id.toLowerCase().includes('sum') &&
                probabilityInputs.length < 5) {
                probabilityInputs.push(input);
            }
        }
        
        // Get values from the probability inputs
        for (var i = 0; i < 5; i++) {
            var value = 0;
            if (i < probabilityInputs.length) {
                value = parseFloat(probabilityInputs[i].value) || 0;
            }
            values.push(value);
            total += value;
        }
        
        return { values: values, total: total };
    }
    
    // Function to update assessment summary
    function updateAssessmentSummary() {
        var data = getCurrentValues();
        var values = data.values;
        var total = data.total;
        
        var narrativeDiv = document.getElementById('narrative-133');
        var cumulativeDiv = document.getElementById('cumulative-133');
        var individualDiv = document.getElementById('individual-133');
        
        if (!narrativeDiv || !cumulativeDiv || !individualDiv) {
            return;
        }
        
        if (total < 1) {
            narrativeDiv.innerHTML = 'Enter your probabilities above to see your assessment summary.';
            cumulativeDiv.innerHTML = 'No data entered yet';
            individualDiv.innerHTML = 'No data entered yet';
            return;
        }
        
        var labels = ['no harmful impacts', 'minor impacts', 'limited impacts', 'moderate impacts', 'significant impacts'];
        var [noHarm, minor, limited, moderate, significant] = values;
        
        // Calculate cumulative probabilities (from most severe upward)
        var cumSignificant = Number(significant) || 0;
        var cumModerate = (Number(moderate) || 0) + cumSignificant;
        var cumLimited = (Number(limited) || 0) + cumModerate;
        var cumMinor = (Number(minor) || 0) + cumLimited;
        
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
        narrativeDiv.innerHTML = narrative;
        
        // Update cumulative probabilities
        var cumulativeHTML = '';
        cumulativeHTML += `<div><strong>${cumMinor.toFixed(0)}%</strong> chance of minor impacts or worse</div>`;
        cumulativeHTML += `<div><strong>${cumLimited.toFixed(0)}%</strong> chance of limited impacts or worse</div>`;
        cumulativeHTML += `<div><strong>${cumModerate.toFixed(0)}%</strong> chance of moderate impacts or worse</div>`;
        cumulativeHTML += `<div><strong>${cumSignificant.toFixed(0)}%</strong> chance of significant impacts</div>`;
        
        cumulativeDiv.innerHTML = cumulativeHTML;
        
        // Update individual probabilities
        var individualHTML = '';
        values.forEach(function(value, index) {
            var numValue = Number(value) || 0;
            individualHTML += `<div><strong>${numValue.toFixed(0)}%</strong> ${labels[index]}</div>`;
        });
        
        individualDiv.innerHTML = individualHTML;
    }
    
    // Insert summary on load
    setTimeout(insertSummary, 1000);
    
    // Set up polling to update summary when values change
    setInterval(function() {
        updateAssessmentSummary();
    }, 500);
    
    // Also update on input events
    setTimeout(function() {
        var inputs = questionContainer.querySelectorAll('input[type="text"]');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('input', updateAssessmentSummary);
            inputs[i].addEventListener('blur', updateAssessmentSummary);
        }
    }, 1000);
});