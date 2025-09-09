Qualtrics.SurveyEngine.addOnload(function() {
    var currentQID = this.questionId;
    var questionContainer = this.getQuestionContainer();
    var intervalId = null;
    
    console.log('Script is running for question:', currentQID);
    
    // Create a unique ID suffix for this question's elements
    var uniqueId = currentQID.replace('QID', '');
    
    // Wait for question to load
    setTimeout(function() {
        
        // Create the main summary display with tighter formatting
        var summaryDiv = document.createElement('div');
        summaryDiv.id = 'summary-container-' + uniqueId;
        summaryDiv.style.marginTop = '20px';
        summaryDiv.style.padding = '15px';
        summaryDiv.style.backgroundColor = '#FAFAFA';
        summaryDiv.style.border = '2px solid #A32035';
        summaryDiv.style.borderRadius = '8px';
        summaryDiv.style.fontFamily = 'Arial, sans-serif';
        
        var htmlContent = '<h3 style="color: #A32035; margin-top: 0; margin-bottom: 12px; font-size: 20px;">Your Assessment Summary</h3>';
        
        // Add narrative summary paragraph
        htmlContent += '<p id="narrative-summary-' + uniqueId + '" style="font-size: 16px; line-height: 1.4; margin-bottom: 15px; padding: 12px; background-color: #E8F4F8; border-left: 3px solid #A32035; color: #1A1A1A;">Calculating your assessment...</p>';
        
        // Individual probabilities FIRST (what user entered)
        htmlContent += '<div style="margin-bottom: 15px;">';
        htmlContent += '<h4 style="color: #A32035; font-size: 17px; margin-bottom: 10px;">Individual Probabilities (your allocation)</h4>';
        htmlContent += '<div id="individual-display-' + uniqueId + '" style="font-size: 15px; line-height: 1.6; color: #1A1A1A;">Calculating...</div>';
        htmlContent += '</div>';
        
        // Add horizontal line separator
        htmlContent += '<hr style="border: none; border-top: 1px solid #D0D0D0; margin: 15px 0;">';
        
        // Cumulative probabilities SECOND
        htmlContent += '<div style="margin-bottom: 15px;">';
        htmlContent += '<h4 style="color: #A32035; font-size: 17px; margin-bottom: 10px;">Cumulative Probabilities (probability of at least this severe)</h4>';
        htmlContent += '<div id="cumulative-display-' + uniqueId + '" style="font-size: 15px; line-height: 1.6; color: #1A1A1A;">Calculating...</div>';
        htmlContent += '</div>';
        
        // Debug section - remove this in production
        htmlContent += '<div style="margin-top: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 4px; font-size: 12px; color: #666;">';
        htmlContent += '<strong>Debug Info:</strong><br>';
        htmlContent += '<div id="debug-display-' + uniqueId + '">Loading...</div>';
        htmlContent += '</div>';
        
        summaryDiv.innerHTML = htmlContent;
        questionContainer.appendChild(summaryDiv);
        
        // Function to update display
        function updateDisplay() {
            // Find ALL input elements within this question container
            var allInputs = questionContainer.querySelectorAll('input');
            var textBoxes = [];
            var debugInfo = [];
            
            // Filter for text inputs and log what we find
            for (var i = 0; i < allInputs.length; i++) {
                var input = allInputs[i];
                if (input.type === 'text' || input.type === 'number') {
                    textBoxes.push(input);
                    debugInfo.push('Input ' + textBoxes.length + ': value="' + input.value + '" id="' + (input.id || 'no-id') + '"');
                }
            }
            
            // Update debug display
            var debugDiv = document.getElementById('debug-display-' + uniqueId);
            if (debugDiv) {
                debugDiv.innerHTML = 'Found ' + textBoxes.length + ' text inputs<br>' + debugInfo.join('<br>');
            }
            
            if (textBoxes.length >= 5) {
                // Read values - be more careful about parsing
                var values = [];
                var labels = ['Minor', 'Limited', 'Moderate', 'Significant', 'Catastrophic'];
                var total = 0;
                
                // If we have 6 inputs, first one might be "no harm"
                var startIndex = textBoxes.length === 6 ? 1 : 0;
                var hasNoHarm = textBoxes.length === 6;
                var noHarm = hasNoHarm ? (parseFloat(textBoxes[0].value) || 0) : 0;
                
                // Read the harm values
                for (var i = 0; i < 5; i++) {
                    var val = parseFloat(textBoxes[startIndex + i].value) || 0;
                    values.push(val);
                    total += val;
                }
                
                if (hasNoHarm) {
                    total += noHarm;
                }
                
                var minor = values[0];
                var limited = values[1];
                var moderate = values[2];
                var significant = values[3];
                var catastrophic = values[4];
                
                // Calculate cumulative probabilities correctly
                var cumCatastrophic = catastrophic;
                var cumSignificant = significant + catastrophic;
                var cumModerate = moderate + significant + catastrophic;
                var cumLimited = limited + moderate + significant + catastrophic;
                var cumMinor = minor + limited + moderate + significant + catastrophic;
                
                // Update individual display
                var individualDiv = document.getElementById('individual-display-' + uniqueId);
                if (individualDiv) {
                    var individualHTML = '';
                    if (hasNoHarm && noHarm > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + noHarm.toFixed(0) + '%</strong> no harm &nbsp;&nbsp;&nbsp; ';
                    }
                    if (minor > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + minor.toFixed(0) + '%</strong> minor harms &nbsp;&nbsp;&nbsp; ';
                    }
                    if (limited > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + limited.toFixed(0) + '%</strong> limited harms &nbsp;&nbsp;&nbsp; ';
                    }
                    if (moderate > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + moderate.toFixed(0) + '%</strong> moderate harms<br>';
                    }
                    if (significant > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + significant.toFixed(0) + '%</strong> significant harms &nbsp;&nbsp;&nbsp; ';
                    }
                    if (catastrophic > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + catastrophic.toFixed(0) + '%</strong> catastrophic harms';
                    }
                    
                    // Add total check
                    individualHTML += '<br><em style="font-size: 13px; color: #666;">Total: ' + total.toFixed(1) + '%</em>';
                    
                    individualDiv.innerHTML = individualHTML || 'No values entered yet';
                }
                
                // Update cumulative display
                var cumulativeDiv = document.getElementById('cumulative-display-' + uniqueId);
                if (cumulativeDiv) {
                    var cumulativeHTML = '';
                    if (cumMinor > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumMinor.toFixed(0) + '%</strong> probability of minor harms or worse<br>';
                    }
                    if (cumLimited > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumLimited.toFixed(0) + '%</strong> probability of limited harms or worse<br>';
                    }
                    if (cumModerate > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumModerate.toFixed(0) + '%</strong> probability of moderate harms or worse<br>';
                    }
                    if (cumSignificant > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumSignificant.toFixed(0) + '%</strong> probability of significant harms or worse<br>';
                    }
                    if (cumCatastrophic > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumCatastrophic.toFixed(0) + '%</strong> probability of catastrophic harms';
                    }
                    
                    cumulativeDiv.innerHTML = cumulativeHTML || 'No values entered yet';
                }
                
                // Update narrative summary
                var narrativeDiv = document.getElementById('narrative-summary-' + uniqueId);
                if (narrativeDiv) {
                    if (Math.abs(total - 100) < 1) {
                        // Find the highest probability
                        var highest = hasNoHarm && noHarm > Math.max(minor, limited, moderate, significant, catastrophic) ? 'no harm' : 
                                     minor >= Math.max(limited, moderate, significant, catastrophic) ? 'minor harms' :
                                     limited >= Math.max(moderate, significant, catastrophic) ? 'limited harms' :
                                     moderate >= Math.max(significant, catastrophic) ? 'moderate harms' :
                                     significant >= catastrophic ? 'significant harms' : 'catastrophic harms';
                        
                        var highestVal = hasNoHarm && highest === 'no harm' ? noHarm :
                                        highest === 'minor harms' ? minor :
                                        highest === 'limited harms' ? limited :
                                        highest === 'moderate harms' ? moderate :
                                        highest === 'significant harms' ? significant : catastrophic;
                        
                        var narrative = 'You expect this risk will most likely result in <strong>' + 
                            highest + '</strong> (' + highestVal.toFixed(0) + '% probability).';
                        
                        if (cumModerate > 0) {
                            narrative += ' The cumulative probability of moderate or worse harms is <strong>' + 
                                cumModerate.toFixed(0) + '%</strong>.';
                        }
                        
                        narrativeDiv.innerHTML = narrative;
                    } else {
                        narrativeDiv.innerHTML = 
                            '<span style="color: #A32035;">Please ensure sliders total exactly 100%. Current total: ' + 
                            total.toFixed(1) + '%</span>';
                    }
                }
            } else {
                // Not enough inputs found
                var individualDiv = document.getElementById('individual-display-' + uniqueId);
                if (individualDiv) {
                    individualDiv.innerHTML = 'Waiting for question inputs to load... (found ' + textBoxes.length + ' inputs)';
                }
            }
        }
        
        // Set up listeners - scoped to this question container only
        questionContainer.addEventListener('input', updateDisplay);
        questionContainer.addEventListener('change', updateDisplay);
        questionContainer.addEventListener('mouseup', updateDisplay);
        questionContainer.addEventListener('touchend', updateDisplay);
        
        // Poll for updates more frequently
        intervalId = setInterval(updateDisplay, 200);
        this.intervalId = intervalId;
        
        // Initial update
        setTimeout(updateDisplay, 100);
        setTimeout(updateDisplay, 1000);
        setTimeout(updateDisplay, 2000);
        
    }.bind(this), 1000);
});

Qualtrics.SurveyEngine.addOnUnload(function() {
    if (this.intervalId) {
        clearInterval(this.intervalId);
    }
});