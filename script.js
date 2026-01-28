// 任务列表
let tasks = [];

// DOM元素
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const prioritySelect = document.getElementById('prioritySelect');
const taskList = document.getElementById('taskList');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const emptyState = document.getElementById('emptyState');

// 初始化应用
function init() {
    // 从本地存储加载任务
    loadTasks();
    // 渲染任务列表
    renderTasks();
    // 更新统计信息
    updateStats();
    // 添加事件监听器
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);
    clearAllBtn.addEventListener('click', clearAll);
}

// 添加任务
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const task = {
            id: Date.now().toString(),
            text: taskText,
            completed: false,
            priority: prioritySelect.value
        };
        tasks.push(task);
        saveTasks();
        renderTasks();
        updateStats();
        taskInput.value = '';
    }
}

// 渲染任务列表
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.priority}`;
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
            <button class="edit-btn" data-id="${task.id}">编辑</button>
            <button class="delete-btn" data-id="${task.id}">删除</button>
        `;
        taskList.appendChild(li);
    });
    
    // 检查是否显示空状态
    checkEmptyState();
    
    // 添加事件监听器
    addTaskEventListeners();
}

// 添加任务事件监听器
function addTaskEventListeners() {
    // 复选框事件
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskId = this.dataset.id;
            toggleTaskStatus(taskId);
        });
    });
    
    // 编辑按钮事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.id;
            editTask(taskId);
        });
    });
    
    // 删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const taskId = this.dataset.id;
            deleteTask(taskId);
        });
    });
}

// 切换任务状态
function toggleTaskStatus(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
    updateStats();
}

// 删除任务
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    updateStats();
}

// 更新统计信息
function updateStats() {
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;
    pendingCount.textContent = `未完成`;
    pendingCount.setAttribute('data-count', pending);
    completedCount.textContent = `已完成`;
    completedCount.setAttribute('data-count', completed);
}

// 保存任务到本地存储
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 从本地存储加载任务
function loadTasks() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
    }
}

// 编辑任务
function editTask(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;
    
    const taskItem = document.querySelector(`.task-item[data-id="${taskId}"]`) || 
                     Array.from(document.querySelectorAll('.task-item')).find(item => 
                         item.querySelector('[data-id="' + taskId + '"]')
                     );
    
    if (taskItem) {
        const originalHTML = taskItem.innerHTML;
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}" disabled>
            <input type="text" class="edit-mode" value="${task.text}" data-id="${task.id}">
            <select class="priority-select-edit" data-id="${task.id}">
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>中</option>
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>高</option>
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>低</option>
            </select>
            <button class="save-btn" data-id="${task.id}">保存</button>
            <button class="cancel-btn" data-id="${task.id}">取消</button>
        `;
        
        // 添加保存和取消按钮的事件监听器
        taskItem.querySelector('.save-btn').addEventListener('click', function() {
            const newText = taskItem.querySelector('.edit-mode').value.trim();
            const newPriority = taskItem.querySelector('.priority-select-edit').value;
            if (newText) {
                tasks = tasks.map(t => {
                    if (t.id === taskId) {
                        return { ...t, text: newText, priority: newPriority };
                    }
                    return t;
                });
                saveTasks();
                renderTasks();
                updateStats();
            }
        });
        
        taskItem.querySelector('.cancel-btn').addEventListener('click', function() {
            taskItem.innerHTML = originalHTML;
            addTaskEventListeners();
        });
        
        // 自动聚焦到编辑输入框
        taskItem.querySelector('.edit-mode').focus();
    }
}

// 清空已完成任务
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateStats();
}

// 全部清空任务
function clearAll() {
    if (confirm('确定要清空所有任务吗？此操作不可恢复。')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateStats();
    }
}

// 检查空状态
function checkEmptyState() {
    if (tasks.length === 0) {
        emptyState.style.display = 'block';
        taskList.style.display = 'none';
        document.querySelector('.stats').style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        taskList.style.display = 'block';
        document.querySelector('.stats').style.display = 'flex';
    }
}

// 初始化应用
init();