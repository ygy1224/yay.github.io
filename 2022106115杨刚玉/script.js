// 页面切换逻辑
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 更新导航状态
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
        
        // 更新内容显示
        const targetId = link.getAttribute('href').substring(1);
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(targetId).classList.add('active');
        
        // 如果是数据可视化页面，初始化图表
        if(targetId === 'visualization') {
            initPieChart();
        }
    });
});

// 初始化饼图
function initPieChart() {
    const chart = echarts.init(document.getElementById('pieChart'));
    const option = {
        title: {
            text: '毕业去向分布',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}%'
        },
        series: [{
            type: 'pie',
            radius: '60%',
            data: [
                {value: 70, name: '考研'},
                {value: 20, name: '考公'},
                {value: 10, name: '工作'}
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    chart.setOption(option);
}

// 初始化首页
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.nav-links a').click();
});

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('ai-search');
    const searchButton = document.getElementById('search-button');
    const searchResults = document.getElementById('search-results');

    // 添加您的OpenAI API密钥
    const OPENAI_API_KEY = 'your-api-key-here';

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return;

        searchResults.style.display = 'block';
        searchResults.innerHTML = '搜索中...';

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: "你是一个知识库助手，请简洁地回答用户的问题。"
                        },
                        {
                            role: "user",
                            content: query
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            
            if (data.choices && data.choices[0]) {
                searchResults.innerHTML = data.choices[0].message.content;
            } else {
                searchResults.innerHTML = '没有找到相关结果';
            }

        } catch (error) {
            searchResults.innerHTML = '搜索时发生错误，请稍后再试';
            console.error('搜索错误:', error);
        }
    }
});

// 留言板功能增强版
document.addEventListener('DOMContentLoaded', function() {
    // 状态管理
    const state = {
        currentUser: null,
        currentPage: 1,
        messagesPerPage: 5,
        totalMessages: 0
    };

    // DOM元素
    const elements = {
        authForm: document.getElementById('auth-form'),
        messageForm: document.querySelector('.message-form'),
        messageList: document.querySelector('.message-list'),
        prevButton: document.getElementById('prev-page'),
        nextButton: document.getElementById('next-page'),
        pageInfo: document.getElementById('page-info')
    };

    // 认证相关功能
    function initAuth() {
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.auth-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
            });
        });

        // 登录处理
        document.getElementById('login-button').addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                // 这里应该调用实际的登录API
                state.currentUser = { email, name: email.split('@')[0] };
                elements.authForm.style.display = 'none';
                elements.messageForm.style.display = 'block';
                loadMessages();
            } catch (error) {
                alert('登录失败：' + error.message);
            }
        });

        // 注册处理
        document.getElementById('register-button').addEventListener('click', async () => {
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
            try {
                // 这里应该调用实际的注册API
                alert('注册成功！请登录');
                document.querySelector('[data-tab="login"]').click();
            } catch (error) {
                alert('注册失败：' + error.message);
            }
        });
    }

    // 留言相关功能
    function initMessages() {
        const submitButton = document.getElementById('submit-message');
        submitButton.addEventListener('click', submitMessage);

        elements.prevButton.addEventListener('click', () => changePage(-1));
        elements.nextButton.addEventListener('click', () => changePage(1));
    }

    async function submitMessage() {
        const content = document.getElementById('message-content').value.trim();
        if (!content) return;

        const message = {
            id: Date.now(),
            content,
            author: state.currentUser.name,
            date: new Date().toLocaleString(),
            userId: state.currentUser.email
        };

        saveMessage(message);
        document.getElementById('message-content').value = '';
        loadMessages();
    }

    function saveMessage(message) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        state.totalMessages = messages.length;
    }

    function loadMessages() {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        state.totalMessages = messages.length;
        
        const startIndex = (state.currentPage - 1) * state.messagesPerPage;
        const endIndex = startIndex + state.messagesPerPage;
        const pageMessages = messages.slice(startIndex, endIndex);

        elements.messageList.innerHTML = '';
        pageMessages.forEach(displayMessage);
        updatePagination();
    }

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-author">${message.author}</span>
                <span class="message-date">${message.date}</span>
            </div>
            <div class="message-content">${message.content}</div>
            ${message.userId === (state.currentUser?.email || '') ? `
                <div class="message-actions">
                    <button class="edit-button" data-id="${message.id}">编辑</button>
                    <button class="delete-button" data-id="${message.id}">删除</button>
                </div>
            ` : ''}
        `;

        // 添加编辑和删除功能
        messageElement.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', () => {
                if (button.classList.contains('edit-button')) {
                    editMessage(message.id);
                } else if (button.classList.contains('delete-button')) {
                    deleteMessage(message.id);
                }
            });
        });

        elements.messageList.appendChild(messageElement);
    }

    function editMessage(messageId) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        const newContent = prompt('编辑留言：', message.content);
        if (newContent && newContent !== message.content) {
            message.content = newContent;
            message.edited = true;
            localStorage.setItem('messages', JSON.stringify(messages));
            loadMessages();
        }
    }

    function deleteMessage(messageId) {
        if (confirm('确定要删除这条留言吗？')) {
            const messages = JSON.parse(localStorage.getItem('messages') || '[]');
            const newMessages = messages.filter(m => m.id !== messageId);
            localStorage.setItem('messages', JSON.stringify(newMessages));
            state.totalMessages = newMessages.length;
            loadMessages();
        }
    }

    function changePage(delta) {
        const newPage = state.currentPage + delta;
        const maxPage = Math.ceil(state.totalMessages / state.messagesPerPage);
        
        if (newPage >= 1 && newPage <= maxPage) {
            state.currentPage = newPage;
            loadMessages();
        }
    }

    function updatePagination() {
        const maxPage = Math.ceil(state.totalMessages / state.messagesPerPage);
        elements.pageInfo.textContent = `第 ${state.currentPage} 页，共 ${maxPage} 页`;
        elements.prevButton.disabled = state.currentPage === 1;
        elements.nextButton.disabled = state.currentPage === maxPage;
    }

    // 初始化
    initAuth();
    initMessages();
}); 