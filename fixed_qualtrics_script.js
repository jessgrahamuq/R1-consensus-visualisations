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
        
        // Validation message - hidden by default since Qualtrics handles validation
        htmlContent += '<div id="validation-msg-' + uniqueId + '" style="display: none; margin-bottom: 0px; padding: 10px; border-radius: 4px; font-size: 15px;"></div>';
        
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
        
        // Simplified explanation dropdown at the bottom
        htmlContent += '<details style="margin-top: 15px;">';
        htmlContent += '<summary style="cursor: pointer; font-weight: bold; color: #A32035; font-size: 16px;">Why are we showing this? (click to expand)</summary>';
        htmlContent += '<div style="margin-top: 12px; font-size: 15px; line-height: 1.6; color: #1A1A1A;">';
        
        htmlContent += '<p style="margin-bottom: 12px; color: #1A1A1A;">Research suggests that seeing cumulative probability distributions helps experts make more well-informed judgments. We intend to report the cumulative probabilities, but we\'re asking you for individual level probabilities because these are easier to assess.</p>';
        
        htmlContent += '<p style="margin-bottom: 10px; color: #1A1A1A;"><strong style="color: #A32035;">Individual Probabilities:</strong> Allocate 100% of outcomes across the different categories you suggested.</p>';
        
        htmlContent += '<p style="margin-bottom: 10px; color: #1A1A1A;"><strong style="color: #A32035;">Cumulative Probabilities:</strong> Add up each level of severity. For example, if 100 people die (moderate harm), that necessarily means at least 10 people died (limited harm) and at least 1 person died (minor harm). So any likelihood of moderate harm includes the likelihood of lesser harms.</p>';
        
        htmlContent += '</div>';
        htmlContent += '</details>';
        
        summaryDiv.innerHTML = htmlContent;
        questionContainer.appendChild(summaryDiv);
        
        // Function to update display
        function updateDisplay() {
            // Find the text input boxes ONLY within this question container
            var textBoxes = questionContainer.querySelectorAll('input[type="text"]');
            
            if (textBoxes.length >= 6) {
                // Get values from the 6 sliders (including "no harm" category)
                var noHarm = parseFloat(textBoxes[0].value) || 0;
                var minor = parseFloat(textBoxes[1].value) || 0;
                var limited = parseFloat(textBoxes[2].value) || 0;
                var moderate = parseFloat(textBoxes[3].value) || 0;
                var significant = parseFloat(textBoxes[4].value) || 0;
                var catastrophic = parseFloat(textBoxes[5].value) || 0;
                
                // Calculate total - should be 100%
                var total = noHarm + minor + limited + moderate + significant + catastrophic;
                
                // Calculate cumulative probabilities CORRECTLY
                // "At least minor" = all categories except no harm
                // "At least limited" = limited + moderate + significant + catastrophic
                // etc.
                var cumMinor = minor + limited + moderate + significant + catastrophic;
                var cumLimited = limited + moderate + significant + catastrophic;
                var cumModerate = moderate + significant + catastrophic;
                var cumSignificant = significant + catastrophic;
                var cumCatastrophic = catastrophic;
                
                // Update cumulative display - using "or worse" language
                var cumulativeDiv = document.getElementById('cumulative-display-' + uniqueId);
                if (cumulativeDiv) {
                    var cumulativeHTML = '';
                    if (cumMinor > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumMinor.toFixed(0) + '%</strong> probability of minor harms or worse &nbsp;&nbsp;&nbsp; ';
                    }
                    if (cumLimited > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumLimited.toFixed(0) + '%</strong> probability of limited harms or worse<br>';
                    }
                    if (cumModerate > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumModerate.toFixed(0) + '%</strong> probability of moderate harms or worse &nbsp;&nbsp;&nbsp; ';
                    }
                    if (cumSignificant > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumSignificant.toFixed(0) + '%</strong> probability of significant harms or worse<br>';
                    }
                    if (cumCatastrophic > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumCatastrophic.toFixed(0) + '%</strong> probability of catastrophic harms';
                    }
                    
                    if (cumulativeHTML === '') {
                        cumulativeHTML = 'No harm expected (100% probability of no harm)';
                    }
                    
                    cumulativeDiv.innerHTML = cumulativeHTML;
                }
                
                // Update individual display
                var individualDiv = document.getElementById('individual-display-' + uniqueId);
                if (individualDiv) {
                    var individualHTML = '';
                    if (noHarm > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + noHarm.toFixed(0) + '%</strong> no harm &nbsp;&nbsp;&nbsp; ';
                    }
                    if (minor > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + minor.toFixed(0) + '%</strong> minor harms &nbsp;&nbsp;&nbsp; ';
                    }
                    if (limited > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + limited.toFixed(0) + '%</strong> limited harms<br>';
                    }
                    if (moderate > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + moderate.toFixed(0) + '%</strong> moderate harms &nbsp;&nbsp;&nbsp; ';
                    }
                    if (significant > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + significant.toFixed(0) + '%</strong> significant harms &nbsp;&nbsp;&nbsp; ';
                    }
                    if (catastrophic > 0) {
                        individualHTML += '<strong style="color: #A32035;">' + catastrophic.toFixed(0) + '%</strong> catastrophic harms';
                    }
                    
                    individualDiv.innerHTML = individualHTML;
                }
                
                // Update narrative summary
                var narrativeDiv = document.getElementById('narrative-summary-' + uniqueId);
                if (narrativeDiv) {
                    if (Math.abs(total - 100) < 0.5) {
                        // Find the highest probability
                        var highest = 'no harm';
                        var highestVal = noHarm;
                        var highestLabel = 'no harm';
                        
                        if (minor > highestVal) { 
                            highest = 'minor harms'; 
                            highestVal = minor;
                            highestLabel = 'minor harms';
                        }
                        if (limited > highestVal) { 
                            highest = 'limited harms'; 
                            highestVal = limited;
                            highestLabel = 'limited harms';
                        }
                        if (moderate > highestVal) { 
                            highest = 'moderate harms'; 
                            highestVal = moderate;
                            highestLabel = 'moderate harms';
                        }
                        if (significant > highestVal) { 
                            highest = 'significant harms'; 
                            highestVal = significant;
                            highestLabel = 'significant harms';
                        }
                        if (catastrophic > highestVal) { 
                            highest = 'catastrophic harms'; 
                            highestVal = catastrophic;
                            highestLabel = 'catastrophic harms';
                        }
                        
                        // Detect risk type from question text
                        var riskType = 'this risk';
                        var questionText = questionContainer.textContent || questionContainer.innerText || '';
                        
                        // Check for mitigation context
                        var mitigationContext = '';
                        if (questionText.toLowerCase().includes('most likely mitigations')) {
                            mitigationContext = 'with the most likely mitigations in place';
                        } else if (questionText.toLowerCase().includes('no additional mitigations')) {
                            mitigationContext = 'with no additional mitigations';
                        }
                        
                        // Detect specific risk type
                        if (questionText.toLowerCase().includes('discrimination') || 
                            questionText.toLowerCase().includes('misrepresentation')) {
                            riskType = 'unfair discrimination and misrepresentation';
                        } else if (questionText.toLowerCase().includes('aggregate')) {
                            riskType = 'aggregate harms';
                        }
                        
                        // Create narrative summary
                        var narrative = 'You expect ' + riskType;
                        if (mitigationContext) {
                            narrative += ' ' + mitigationContext;
                        }
                        
                        if (highest === 'no harm') {
                            narrative += ' will most likely result in <strong>no harm</strong> (' + 
                                highestVal.toFixed(0) + '% probability).';
                        } else {
                            narrative += ' will most likely result in <strong>' + 
                                highestLabel + '</strong> (' + highestVal.toFixed(0) + '% probability).';
                            
                            // Add cumulative probability statement
                            if (cumModerate > 0) {
                                narrative += ' The cumulative probability of moderate or worse harms is <strong>' + 
                                    cumModerate.toFixed(0) + '%</strong>.';
                            }
                        }
                        
                        // Add catastrophic warning if relevant
                        if (catastrophic >= 20) {
                            narrative += ' <span style="color: #A32035;">Note: You assess a ' + 
                                catastrophic.toFixed(0) + '% probability of catastrophic harms.</span>';
                        }
                        
                        narrativeDiv.innerHTML = narrative;
                    } else {
                        narrativeDiv.innerHTML = 
                            '<span style="color: #1A1A1A;">Please ensure sliders total exactly 100%. Current total: ' + 
                            total.toFixed(1) + '%</span>';
                    }
                }
            } else if (textBoxes.length >= 5) {
                // Handle 5-slider version (without no harm category)
                var minor = parseFloat(textBoxes[0].value) || 0;
                var limited = parseFloat(textBoxes[1].value) || 0;
                var moderate = parseFloat(textBoxes[2].value) || 0;
                var significant = parseFloat(textBoxes[3].value) || 0;
                var catastrophic = parseFloat(textBoxes[4].value) || 0;
                
                // Debug: Log the values
                console.log('Values (5 sliders): Minor=' + minor + ', Limited=' + limited + 
                           ', Moderate=' + moderate + ', Significant=' + significant + ', Catastrophic=' + catastrophic);
                
                // Calculate total - should be 100%
                var total = minor + limited + moderate + significant + catastrophic;
                
                // Calculate cumulative probabilities CORRECTLY - from most severe upward
                var cumCatastrophic = catastrophic;
                var cumSignificant = significant + catastrophic;
                var cumModerate = moderate + significant + catastrophic;
                var cumLimited = limited + moderate + significant + catastrophic;
                var cumMinor = minor + limited + moderate + significant + catastrophic; // Should equal 100% if inputs are valid
                
                // Update displays
                var cumulativeDiv = document.getElementById('cumulative-display-' + uniqueId);
                if (cumulativeDiv) {
                    var cumulativeHTML = '';
                    if (cumMinor > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumMinor.toFixed(0) + '%</strong> probability of minor harms or worse &nbsp;&nbsp;&nbsp; ';
                    }
                    if (cumLimited > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumLimited.toFixed(0) + '%</strong> probability of limited harms or worse<br>';
                    }
                    if (cumModerate > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumModerate.toFixed(0) + '%</strong> probability of moderate harms or worse &nbsp;&nbsp;&nbsp; ';
                    }
                    if (cumSignificant > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumSignificant.toFixed(0) + '%</strong> probability of significant harms or worse<br>';
                    }
                    if (cumCatastrophic > 0) {
                        cumulativeHTML += '<strong style="color: #A32035;">' + cumCatastrophic.toFixed(0) + '%</strong> probability of catastrophic harms';
                    }
                    
                    if (cumulativeHTML === '') {
                        cumulativeHTML = 'No assessments entered yet';
                    }
                    
                    cumulativeDiv.innerHTML = cumulativeHTML;
                }
                
                var individualDiv = document.getElementById('individual-display-' + uniqueId);
                if (individualDiv) {
                    var individualHTML = '';
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
                    
                    if (individualHTML === '') {
                        individualHTML = 'No assessments entered yet';
                    }
                    
                    individualDiv.innerHTML = individualHTML;
                }
                
                // Similar narrative logic without no harm option
                var narrativeDiv = document.getElementById('narrative-summary-' + uniqueId);
                if (narrativeDiv) {
                    if (Math.abs(total - 100) < 0.5) {
                        var highest = 'minor harms';
                        var highestVal = minor;
                        
                        if (limited > highestVal) { 
                            highest = 'limited harms'; 
                            highestVal = limited; 
                        }
                        if (moderate > highestVal) { 
                            highest = 'moderate harms'; 
                            highestVal = moderate; 
                        }
                        if (significant > highestVal) { 
                            highest = 'significant harms'; 
                            highestVal = significant; 
                        }
                        if (catastrophic > highestVal) { 
                            highest = 'catastrophic harms'; 
                            highestVal = catastrophic; 
                        }
                        
                        var riskType = 'this risk';
                        var questionText = questionContainer.textContent || questionContainer.innerText || '';
                        var mitigationContext = '';
                        
                        if (questionText.toLowerCase().includes('most likely mitigations')) {
                            mitigationContext = 'with the most likely mitigations in place';
                        } else if (questionText.toLowerCase().includes('no additional mitigations')) {
                            mitigationContext = 'with no additional mitigations';
                        }
                        
                        if (questionText.toLowerCase().includes('discrimination') || 
                            questionText.toLowerCase().includes('misrepresentation')) {
                            riskType = 'unfair discrimination and misrepresentation';
                        } else if (questionText.toLowerCase().includes('aggregate')) {
                            riskType = 'aggregate harms';
                        }
                        
                        var narrative = 'You expect ' + riskType;
                        if (mitigationContext) {
                            narrative += ' ' + mitigationContext;
                        }
                        narrative += ' will most likely result in <strong>' + 
                            highest + '</strong> (' + highestVal.toFixed(0) + '% probability).';
                        
                        if (cumModerate > 0) {
                            narrative += ' The cumulative probability of moderate or worse harms is <strong>' + 
                                cumModerate.toFixed(0) + '%</strong>.';
                        }
                        
                        if (catastrophic >= 20) {
                            narrative += ' <span style="color: #A32035;">Note: You assess a ' + 
                                catastrophic.toFixed(0) + '% probability of catastrophic harms.</span>';
                        }
                        
                        narrativeDiv.innerHTML = narrative;
                    } else {
                        narrativeDiv.innerHTML = 
                            '<span style="color: #1A1A1A;">Please ensure sliders total exactly 100%. Current total: ' + 
                            total.toFixed(1) + '%</span>';
                    }
                }
            }
        }
        
        // Set up listeners - scoped to this question container only
        questionContainer.addEventListener('input', updateDisplay);
        questionContainer.addEventListener('change', updateDisplay);
        questionContainer.addEventListener('mouseup', updateDisplay);
        questionContainer.addEventListener('touchend', updateDisplay);
        
        // Poll for updates
        intervalId = setInterval(updateDisplay, 300);
        this.intervalId = intervalId;
        
        // Initial update
        setTimeout(updateDisplay, 100);
        setTimeout(updateDisplay, 500);
        
    }.bind(this), 1000);
});

Qualtrics.SurveyEngine.addOnUnload(function() {
    if (this.intervalId) {
        clearInterval(this.intervalId);
    }
});