import Student from '@/pages/Users/Student'
import Teacher from '@/pages/Users/Teacher'
import TeacherEdit from '@/pages/Users/Teacher/TeacherEdit'
import TeacherAdd from '@/pages/Users/Teacher/TeacherAdd'
import StudentEdit from '@/pages/Users/Student/StudentEdit'
import Lesson from '@/pages/Lesson'
import LessonAdd from '@/pages/Lesson/LessonAdd'
import LessonEdit from '@/pages/Lesson/LessonEdit'
import CoursewareEdit from '@/pages/Lesson/CoursewareEdit'
import Class from '@/pages/Class'
import ClassEdit from '@/pages/Class/ClassEdit'
import ClassAdd from '@/pages/Class/ClassAdd'
import Demand from '@/pages/Demand'
import DemandEdit from '@/pages/Demand/DemandEdit'

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
                children: [
                    {
                        path: 'edit',
                        name: 'teacherEdit',
                        component: TeacherEdit,
                        hidden: true,
                        meta: { title: '老师编辑'},
                    },
                    {
                        path: 'add',
                        name: 'teacherAdd',
                        component: TeacherAdd,
                        hidden: true,
                        meta: { title: '新建教师'},
                    }
                ]
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
                        meta: { title: '学生编辑'},
                    }
                ]
            },
        ]
    },
    {
        path: '/lesson',
        name: 'lesson',
        component: Lesson,
        meta: { title: '课程', icon: 'icon-lesson'},
        children: [
            {
                path: 'add',
                name: 'lessonAdd',
                component: LessonAdd,
                hidden: true,
                meta: { title: '新建课程'}
            },
            {
                path: 'edit',
                name: 'lessonEdit',
                component: LessonEdit,
                hidden: true,
                meta: { title: '课程编辑'},
                children: [
                    {
                        path: 'coursewareEdit',
                        name: 'coursewareEdit',
                        component: CoursewareEdit,
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
                meta: { title: '班级编辑'}
            },
            {
                path: 'add',
                name: 'classAdd',
                component: ClassAdd,
                hidden: true,
                meta: { title: '新建班级'}
            }
        ]
    },
    {
        path: '/demand',
        name: 'demand',
        component: Demand,
        meta: { title: '需求', icon: 'icon-demandmanagement'},
        children: [
            {
                path: 'edit',
                name: 'demandEdit',
                component: DemandEdit,
                hidden: true,
                meta: { title: '需求编辑'}
            }
        ]
    }
];

export default routes
