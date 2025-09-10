Qualtrics.SurveyEngine.addOnload(function() {
    /*Place your JavaScript here to run when the page loads*/
    
    // Create the visualization container HTML - starts hidden
    var vizHTML = `
        <div id="probVizContainer" style="margin: 20px 0 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: none;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333;">
                Probability Distribution
            </div>
            <div id="probBarChart" style="width: 100%; height: 250px; background: #fff; border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: flex-end; justify-content: space-evenly; padding: 20px;"></div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; font-size: 13px; justify-content: center;">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 16px; height: 16px; border-radius: 3px; background: #28a745; border: 1px solid rgba(0,0,0,0.1);"></div>
                    <span>No Harm</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 16px; height: 16px; border-radius: 3px; background: #6c757d; border: 1px solid rgba(0,0,0,0.1);"></div>
                    <span>Limited Harm</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 16px; height: 16px; border-radius: 3px; background: #ffc107; border: 1px solid rgba(0,0,0,0.1);"></div>
                    <span>Moderate Harm</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 16px; height: 16px; border-radius: 3px; background: #fd7e14; border: 1px solid rgba(0,0,0,0.1);"></div>
                    <span>Significant Harm</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                    <div style="width: 16px; height: 16px; border-radius: 3px; background: #dc3545; border: 1px solid rgba(0,0,0,0.1);"></div>
                    <span>Catastrophic Harm</span>
                </div>
            </div>
            <div id="totalDisplay" style="margin-top: 15px; text-align: center; font-size: 16px; font-weight: bold; padding: 10px; border-radius: 6px; background: #f8f9fa; border: 2px solid #ddd;">Total: 0%</div>
        </div>
    `;
    
    // Get the question container and insert visualization
    var questionContainer = this.getQuestionContainer();
    var questionText = questionContainer.querySelector('.QuestionText');
    
    // Insert the visualization after the question text
    if (questionText) {
        questionText.insertAdjacentHTML('afterend', vizHTML);
    }
    
    // Create clean chart bars
    function createChart() {
        var barChart = document.getElementById('probBarChart');
        if (!barChart) return;
        
        var colors = ['#28a745', '#6c757d', '#ffc107', '#fd7e14', '#dc3545'];
        
        barChart.innerHTML = '';
        
        for (var i = 0; i < 5; i++) {
            var column = document.createElement('div');
            column.style.cssText = 'display: flex; flex-direction: column; align-items: center; flex: 1; position: relative;';
            
            // Percentage label (hidden initially)
            var percentLabel = document.createElement('div');
            percentLabel.style.cssText = 'font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px; min-height: 20px;';
            percentLabel.id = 'percent-' + i;
            
            // Bar (larger)
            var bar = document.createElement('div');
            bar.style.cssText = 'width: 60px; border-radius: 4px 4px 0 0; transition: height 0.3s ease; height: 0px; min-height: 3px;';
            bar.style.backgroundColor = colors[i];
            bar.id = 'bar-' + i;
            
            column.appendChild(percentLabel);
            column.appendChild(bar);
            barChart.appendChild(column);
        }
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
    
    // Update chart with current values
    function updateVisualization() {
        var data = getSliderValues();
        var values = data.values;
        var total = data.total;
        
        var container = document.getElementById('probVizContainer');
        var totalDisplay = document.getElementById('totalDisplay');
        
        if (!container || !totalDisplay) return;
        
        // Show chart only if we have values
        var hasValues = values.some(function(v) { return v > 0; });
        container.style.display = hasValues ? 'block' : 'none';
        
        if (!hasValues) return;
        
        // Update each bar and percentage label
        for (var i = 0; i < 5; i++) {
            var bar = document.getElementById('bar-' + i);
            var percentLabel = document.getElementById('percent-' + i);
            
            if (bar && percentLabel) {
                var value = values[i] || 0;
                var height = Math.max(value * 2, value > 0 ? 8 : 0); // Scale to max 200px, min 8px when > 0
                
                bar.style.height = height + 'px';
                percentLabel.textContent = value > 0 ? value.toFixed(0) + '%' : '';
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
            totalDisplay.style.borderColor = '#ddd';
            totalDisplay.style.color = '#666';
        }
    }
    
    // Set up event listeners for slider changes
    function setupListeners() {
        // Listen for any input changes in the question container
        questionContainer.addEventListener('input', function(e) {
            setTimeout(updateVisualization, 10);
        });
        
        questionContainer.addEventListener('change', function(e) {
            setTimeout(updateVisualization, 10);
        });
        
        // Listen for mouse events on sliders
        questionContainer.addEventListener('mouseup', function(e) {
            if (e.target.closest('.slider-container, .slider-track, .slider-handle')) {
                setTimeout(updateVisualization, 10);
            }
        });
        
        // Listen for touch events (mobile)
        questionContainer.addEventListener('touchend', function(e) {
            if (e.target.closest('.slider-container, .slider-track, .slider-handle')) {
                setTimeout(updateVisualization, 10);
            }
        });
        
        // Set up mutation observer to catch dynamic changes
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    (mutation.attributeName === 'aria-valuenow' || 
                     mutation.attributeName === 'value')) {
                    updateVisualization();
                }
            });
        });
        
        // Observe all slider handles and inputs
        var handles = questionContainer.querySelectorAll('.slider-handle');
        handles.forEach(function(handle) {
            observer.observe(handle, { attributes: true });
        });
        
        var inputs = questionContainer.querySelectorAll('input');
        inputs.forEach(function(input) {
            observer.observe(input, { attributes: true });
        });
    }
    
    // Initialize everything
    createChart();
    setupListeners();
    
    // Initial update with a slight delay to ensure sliders are loaded
    setTimeout(updateVisualization, 100);
    setTimeout(updateVisualization, 500);
});

Qualtrics.SurveyEngine.addOnReady(function() {
    /*Place your JavaScript here to run when the page is fully displayed*/
    
    // Force an update when page is ready
    var questionContainer = this.getQuestionContainer();
    
    function updateViz() {
        var event = new Event('input', { bubbles: true });
        questionContainer.dispatchEvent(event);
    }
    
    setTimeout(updateViz, 100);
});

Qualtrics.SurveyEngine.addOnUnload(function() {
    /*Place your JavaScript here to run when the page is unloaded*/
    
});