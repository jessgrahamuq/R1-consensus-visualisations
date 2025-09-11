Qualtrics.SurveyEngine.addOnload(function() {
    /*Place your JavaScript here to run when the page loads - QID157 ONLY*/
    
    // Hard-coded for QID157
    var currentQID = 'QID157';
    var uniqueId = '157';
    
    // Add styles to the page for color classes
    var styleElement = document.createElement('style');
    styleElement.innerHTML = `
        .prob-bar-0 { background-color: #28a745 !important; }
        .prob-bar-1 { background-color: #6c757d !important; }
        .prob-bar-2 { background-color: #ffc107 !important; }
        .prob-bar-3 { background-color: #fd7e14 !important; }
        .prob-bar-4 { background-color: #dc3545 !important; }
        .prob-legend-0 { background-color: #28a745 !important; }
        .prob-legend-1 { background-color: #6c757d !important; }
        .prob-legend-2 { background-color: #ffc107 !important; }
        .prob-legend-3 { background-color: #fd7e14 !important; }
        .prob-legend-4 { background-color: #dc3545 !important; }
    `;
    document.head.appendChild(styleElement);
    
    // Create the visualization container HTML - removed blue background from outer container
    var vizHTML = `
        <div id="probVizContainer-157" style="margin: 10px 0 15px 0; padding: 20px; padding-bottom: 10px; border-radius: 8px; display: block;">
            <div id="probBarChart-157" style="width: 100%; height: 280px; background: #f0f8ff; border: 2px solid #999; border-radius: 4px; display: flex; align-items: flex-end; justify-content: space-evenly; padding: 25px 20px 20px 10px; box-sizing: border-box;"></div>
            <div id="totalDisplay-157" style="width: 100%; margin-top: 15px; text-align: center; font-size: 16px; font-weight: bold; padding: 10px; border-radius: 6px; background: #f8f9fa; border: 2px solid #ddd; box-sizing: border-box;">Total: 0%</div>
        </div>
    `;
    
    // Get the question container and insert visualization
    var questionContainer = this.getQuestionContainer();
    var questionText = questionContainer.querySelector('.QuestionText');
    
    // Insert the visualization after the question text
    if (questionText) {
        questionText.insertAdjacentHTML('afterend', vizHTML);
    }
    
    // Add harm examples block below the input fields - fixed text wrapping and spacing
    var harmExamples = [
        '<b>Examples</b><br>No adverse impacts occur', // No harm
        '<b>Examples</b><br>• Minor injuries or moderate<br>&nbsp;&nbsp;environmental damage<br>• Infrastructure disruption<br>&nbsp;&nbsp;< $10K damage<br>• Mildly offensive content or<br>&nbsp;&nbsp;minor privacy breach<br>• Minor bias or slight voting<br>&nbsp;&nbsp;irregularities', // Limited harm
        '<b>Examples</b><br>• Severe injuries or significant<br>&nbsp;&nbsp;environmental damage<br>• City-wide outages,<br>&nbsp;&nbsp;$10K-$1M damage<br>• Hate speech or privacy<br>&nbsp;&nbsp;breach (100-1M people)<br>• Clear discrimination or<br>&nbsp;&nbsp;election manipulation', // Moderate harm
        '<b>Examples</b><br>• 1-99 casualties or<br>&nbsp;&nbsp;ecosystem damage<br>• Regional disruption,<br>&nbsp;&nbsp;$1M-$100M damage<br>• Incitement to violence or<br>&nbsp;&nbsp;breach (>1M people)<br>• Institutionalized discrimination<br>&nbsp;&nbsp;or democratic subversion', // Significant harm
        '<b>Examples</b><br>• 100+ casualties or species<br>&nbsp;&nbsp;extinction<br>• National infrastructure failure,<br>&nbsp;&nbsp;$100M+ damage<br>• Mass radicalization or total<br>&nbsp;&nbsp;surveillance<br>• Systematic rights violations or<br>&nbsp;&nbsp;democratic breakdown' // Catastrophic harm
    ];
    
    // Find the container with the input fields/sliders
    var choicesContainer = questionContainer.querySelector('.ChoiceStructure, .QuestionBody, .Inner, tbody');
    
    // Check if we haven't already added the examples block
    if (choicesContainer && !document.getElementById('harmExamplesBlock')) {
        // Create a container for all harm examples - much smaller gap
        var examplesBlock = document.createElement('div');
        examplesBlock.id = 'harmExamplesBlock';
        examplesBlock.style.cssText = 'display: flex; justify-content: flex-start; gap: 12px; margin-top: -15px; margin-bottom: 35px; padding: 8px; padding-left: 10px; border-radius: 6px;';
        
        // Create individual boxes for each harm level with better spacing
        for (var i = 0; i < 5; i++) {
            var harmBox = document.createElement('div');
            // Remove the negative margins to give more space between columns
            harmBox.style.cssText = 'width: 19%; font-size: 12px; line-height: 1.4; color: #666; padding-right: 5px;';
            
            // Add the examples text directly (already has <br> tags)
            harmBox.innerHTML = harmExamples[i];
            
            examplesBlock.appendChild(harmBox);
        }
        
        // Insert the examples block after the choices container
        choicesContainer.parentNode.insertBefore(examplesBlock, choicesContainer.nextSibling);
    }
    
    // Create clean chart bars with unique IDs
    function createChart() {
        var barChart = document.getElementById('probBarChart-157');
        if (!barChart) return;
        
        var colors = ['#28a745', '#6c757d', '#ffc107', '#fd7e14', '#dc3545'];
        
        barChart.innerHTML = '';
        
        // Create a wrapper to better control spacing - adjusted to match input field spacing
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display: flex; width: 100%; height: 100%; align-items: flex-end; justify-content: space-between; padding: 0 45px;';
        
        for (var i = 0; i < 5; i++) {
            var column = document.createElement('div');
            column.style.cssText = 'display: flex; flex-direction: column; align-items: center; width: 16%; position: relative;';
            
            // Percentage label (hidden initially)
            var percentLabel = document.createElement('div');
            percentLabel.style.cssText = 'font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px; min-height: 20px;';
            percentLabel.id = 'percent-157-' + i;
            
            // Bar (larger)
            var bar = document.createElement('div');
            bar.style.cssText = 'width: 60px; border-radius: 4px 4px 0 0; transition: height 0.3s ease; height: 0px; min-height: 3px;';
            bar.style.backgroundColor = colors[i];
            bar.id = 'bar-157-' + i;
            
            column.appendChild(percentLabel);
            column.appendChild(bar);
            wrapper.appendChild(column);
        }
        
        barChart.appendChild(wrapper);
    }
    
    // Function to get slider values (handles different Qualtrics slider types)
    function getSliderValues() {
        var values = [];
        var total = 0;
        
        // Try to find slider track divs (modern Qualtrics sliders)
        var sliderTracks = questionContainer.querySelectorAll('.slider-track');
        
        if (sliderTracks.length > 0) {
            // Modern slider approach - get exactly 5 sliders
            sliderTracks.forEach(function(track, index) {
                if (index < 5) { // Only get first 5 sliders, ignore total
                    var handle = track.querySelector('.slider-handle');
                    if (handle) {
                        var value = parseFloat(handle.getAttribute('aria-valuenow')) || 0;
                        values.push(value);
                        total += value;
                    }
                }
            });
        } else {
            // Fallback to input fields - look for the result inputs specifically
            var rows = questionContainer.querySelectorAll('.choice');
            
            rows.forEach(function(row, index) {
                if (index < 5) { // Only process first 5 rows (harm categories)
                    var input = row.querySelector('input.ResultsInput, input[type="text"]:not([readonly]), input[type="hidden"]');
                    if (input && !input.closest('.total-row') && !input.id.includes('total')) {
                        var val = parseFloat(input.value) || 0;
                        values.push(val);
                        total += val;
                    }
                }
            });
            
            // If that didn't work, try another approach
            if (values.length === 0) {
                var inputs = questionContainer.querySelectorAll('input.ResultsInput, input[type="text"]');
                var count = 0;
                inputs.forEach(function(input) {
                    // Skip if this is the total field (usually last or has 'total' in name/id)
                    if (count < 5 && !input.readOnly && !input.id.toLowerCase().includes('total')) {
                        var val = parseFloat(input.value) || 0;
                        values.push(val);
                        total += val;
                        count++;
                    }
                });
            }
        }
        
        // Ensure we have exactly 5 values
        while (values.length < 5) {
            values.push(0);
        }
        
        return { values: values.slice(0, 5), total: total };
    }
    
    // Update chart with current values using unique IDs
    function updateVisualization() {
        var data = getSliderValues();
        var values = data.values;
        var total = data.total;
        
        var container = document.getElementById('probVizContainer-157');
        var totalDisplay = document.getElementById('totalDisplay-157');
        
        if (!container || !totalDisplay) return;
        
        // Always show the chart container
        container.style.display = 'block';
        
        // Update each bar and percentage label - only show values 0-100
        for (var i = 0; i < 5; i++) {
            var bar = document.getElementById('bar-157-' + i);
            var percentLabel = document.getElementById('percent-157-' + i);
            
            if (bar && percentLabel) {
                var value = values[i] || 0;
                
                // Only display values between 0-100
                if (value > 100) {
                    // Don't show anything for values over 100
                    bar.style.height = '0px';
                    percentLabel.textContent = '';
                } else if (value > 0) {
                    // Taller bars - scale to use full height (2.2x for max 220px at 100%)
                    var height = Math.max(value * 2.2, 8);
                    bar.style.height = height + 'px';
                    percentLabel.textContent = value.toFixed(0) + '%';
                } else {
                    bar.style.height = '0px';
                    percentLabel.textContent = '';
                }
            }
        }
        
        // Update total with exact 100% check and styling
        if (Math.abs(total - 100) < 0.01) { // Exactly 100%
            totalDisplay.innerHTML = '✓ Total: ' + total.toFixed(1) + '%';
            totalDisplay.style.backgroundColor = '#d4edda';
            totalDisplay.style.borderColor = '#28a745';
            totalDisplay.style.color = '#155724';
        } else if (total > 0) {
            totalDisplay.textContent = 'Total: ' + total.toFixed(1) + '%';
            totalDisplay.style.backgroundColor = '#f8d7da';
            totalDisplay.style.borderColor = '#dc3545';
            totalDisplay.style.color = '#721c24';
        } else {
            totalDisplay.textContent = 'Total: 0%';
            totalDisplay.style.backgroundColor = '#f8f9fa';
            totalDisplay.style.borderColor = '#999';
            totalDisplay.style.color = '#666';
        }
    }
    
    // Set up event listeners for slider changes
    function setupListeners() {
        console.log('Setting up listeners for QID157');
        
        // Listen for any input changes in the question container
        questionContainer.addEventListener('input', function(e) {
            console.log('QID157 - Input event detected:', e.target);
            setTimeout(updateVisualization, 50);
        });
        
        questionContainer.addEventListener('change', function(e) {
            console.log('QID157 - Change event detected:', e.target);
            setTimeout(updateVisualization, 50);
        });
        
        // Listen for mouse events on sliders
        questionContainer.addEventListener('mouseup', function(e) {
            console.log('QID157 - Mouse up event detected');
            setTimeout(updateVisualization, 50);
        });
        
        // Continuous polling every 300ms as backup - store for cleanup
        window.qid157Interval = setInterval(function() {
            updateVisualization();
        }, 300);
    }
    
    // Initialize everything
    createChart();
    setupListeners();
    
    // Initial update with delays
    setTimeout(updateVisualization, 100);
    setTimeout(updateVisualization, 500);
    setTimeout(updateVisualization, 1000);
});

Qualtrics.SurveyEngine.addOnReady(function() {
    /*Place your JavaScript here to run when the page is fully displayed*/
    
    function updateViz() {
        var questionContainer = this.getQuestionContainer();
        var event = new Event('input', { bubbles: true });
        questionContainer.dispatchEvent(event);
    }
    
    setTimeout(updateViz.bind(this), 100);
});

Qualtrics.SurveyEngine.addOnUnload(function() {
    /*Place your JavaScript here to run when the page is unloaded*/
    
    // Clear the polling interval
    if (window.qid157Interval) {
        clearInterval(window.qid157Interval);
        console.log('QID157 - Cleared polling interval');
    }
});

// SCRIPT 2