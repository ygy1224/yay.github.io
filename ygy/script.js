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