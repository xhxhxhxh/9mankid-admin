import Student from '@/pages/Users/Student'
import Teacher from '@/pages/Users/Teacher'
import StudentEdit from '@/pages/Users/Student/StudentEdit'
import CoursewareEdit from '@/pages/Courseware/CoursewareEdit'
import Class from '@/pages/Class'
import ClassEdit from '@/pages/Class/ClassEdit'
import Account from '@/pages/Account'
import Courseware from '@/pages/Courseware'

const routes = [
    {
        path: '/user',
        redirect: '/user/teacher',
        name: 'user',
        meta: { title: '用户', icon: 'icon-user' },
        children: [
            {
                path: 'teacher',
                name: 'teacher',
                component: Teacher,
                meta: { title: '老师', icon: 'icon-Group' },
            },
            {
                path: 'student',
                name: 'student',
                component: Student,
                meta: { title: '学生', icon: 'icon-student' },
                children: [
                    {
                        path: 'edit',
                        name: 'studentEdit',
                        component: StudentEdit,
                        hidden: true,
                        meta: { title: '学生账户详情'},
                    }
                ]
            },
        ]
    },
    {
        path: '/courseware',
        name: 'courseware',
        redirect: '/courseware/formal',
        meta: { title: '课件', icon: 'icon-courseware'},
        children: [
            {
                path: 'formal',
                name: 'formalCourseware',
                component: Courseware,
                meta: { title: '正式课件', icon: 'icon-lesson'},
                children: [
                    {
                        path: 'edit',
                        name: 'edit',
                        component: CoursewareEdit,
                        hidden: true,
                        meta: { title: '课件编辑'}
                    }
                ]
            },
            {
                path: 'test',
                name: 'testCourseware',
                component: Courseware,
                meta: { title: '试听课件', icon: 'icon-audio'},
                children: [
                    {
                        path: 'edit',
                        name: 'edit',
                        component: CoursewareEdit,
                        hidden: true,
                        meta: { title: '课件编辑'}
                    }
                ]
            }
        ]
    },
    {
        path: '/class',
        name: 'class',
        component: Class,
        meta: { title: '班级', icon: 'icon-class'},
        children: [
            {
                path: 'edit',
                name: 'classEdit',
                component: ClassEdit,
                hidden: true,
                meta: { title: '班级信息'}
            },
        ]
    },
    {
        path: '/account',
        name: 'account',
        component: Account,
        meta: { title: '后台账户', icon: 'icon-IDcard'},
    }
];

export default routes
