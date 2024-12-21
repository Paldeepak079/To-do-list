document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    // Load tasks from storage
    chrome.storage.sync.get(['tasks'], function(result) {
        const tasks = result.tasks || [];
        tasks.forEach(function(task) {
            addTaskToDOM(task.text, task.priority);
        });
    });

    // Add task on pressing Enter
    taskInput.addEventListener('keydown', function(event) {
        console.log('Key pressed:', event.key); // Debugging line
        if (event.key === 'Enter') {
            const task = taskInput.value.trim();
            console.log('Task:', task); // Debugging line
            if (task) {
                addTaskToDOM(task, false);
                saveTask(task, false);
                taskInput.value = '';
            }
        }
    });

    // Add task to the DOM
    function addTaskToDOM(task, priority) {
        const li = document.createElement('li');
        li.textContent = task;
        li.draggable = true;
        if (priority) {
            li.classList.add('priority');
        }

        // Right-click to delete
        li.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            taskList.removeChild(li);
            removeTask(task);
        });

        // Middle-click to prioritize
        li.addEventListener('mousedown', function(event) {
            if (event.button === 1) {
                li.classList.toggle('priority');
                prioritizeTask(task);
            }
        });

        // Drag and drop functionality
        li.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', task);
        });

        li.addEventListener('dragover', function(event) {
            event.preventDefault();
        });

        li.addEventListener('drop', function(event) {
            event.preventDefault();
            const draggedTask = event.dataTransfer.getData('text/plain');
            const draggedElement = [...taskList.children].find(li => li.textContent === draggedTask);
            if (draggedElement && draggedElement !== li) {
                taskList.insertBefore(draggedElement, li.nextSibling);
                reorderTasks();
            }
        });

        taskList.appendChild(li);
    }

    // Save task to storage
    function saveTask(task, priority) {
        chrome.storage.sync.get(['tasks'], function(result) {
            const tasks = result.tasks || [];
            tasks.push({ text: task, priority: priority });
            chrome.storage.sync.set({ tasks: tasks });
        });
    }

    // Remove task from storage
    function removeTask(task) {
        chrome.storage.sync.get(['tasks'], function(result) {
            let tasks = result.tasks || [];
            tasks = tasks.filter(t => t.text !== task);
            chrome.storage.sync.set({ tasks: tasks });
        });
    }

    // Prioritize task in storage
    function prioritizeTask(task) {
        chrome.storage.sync.get(['tasks'], function(result) {
            let tasks = result.tasks || [];
            tasks.forEach(t => {
                if (t.text === task) {
                    t.priority = !t.priority;
                }
            });
            chrome.storage.sync.set({ tasks: tasks });
        });
    }

    // Reorder tasks in storage
    function reorderTasks() {
        const tasks = [...taskList.children].map(li => ({
            text: li.textContent,
            priority: li.classList.contains('priority')
        }));
        chrome.storage.sync.set({ tasks: tasks });
    }

    // Toggle mini mode
    let isMiniMode = false;
    document.body.addEventListener('dblclick', function(event) {
        if (event.target === document.body) {
            isMiniMode = !isMiniMode;
            document.body.classList.toggle('mini-mode', isMiniMode);
        }
    });
});