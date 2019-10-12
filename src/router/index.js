const routes = [
    {
        path: '/user',
        redirect: '/user/teacher',
        name: 'user',
        meta: { title: '用户', icon: 'user' },
        children: [
            {
                path: 'teacher',
                name: 'teacher',
                componentPath: '@/pages/Users/Teacher',
                meta: { title: '老师', icon: 'user' },
            },
            {
                path: 'student',
                name: 'student',
                componentPath: '@/pages/Users/Student',
                meta: { title: '学生', icon: 'user' }
            },
        ]
    },
]

export default routes
