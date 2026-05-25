export const mockScheduleData = {
    groups: {
        'IS-31': {
            fullRemote: false,
            lessons: [
                {
                    number: 1, time: '08:30', name: 'Математический анализ',
                    meta: 'Ларина М.В. • 402',
                    changes: {
                        type: 'replacement',
                        was: 'Доцент Петров',
                        now: 'Ларина М.В.'
                    }
                },
                {
                    number: 2, time: '10:15', name: 'Базы данных',
                    meta: 'Сухов Д.А. • 218б',
                    changes: {
                        type: 'remote',
                        now: 'Дистанционно'
                    }
                },
                {
                    number: 3, time: '12:15', name: 'Английский язык',
                    meta: 'Рудакова Е.В. • 301',
                    status: 'cancelled'
                },
                {
                    number: 4, time: '14:00', name: 'Физкультура',
                    meta: 'Семёнов И.П. • спортзал',
                    changes: {
                        type: 'rescheduled',
                        was: '4 пара',
                        now: '5 пара (15:00)'
                    }
                }
            ]
        },
        'IS-32': {
            fullRemote: true,
            lessons: [
                { number: 1, time: '08:30', name: 'Физика', meta: 'Петров А.Б. • 305' },
                { number: 2, time: '10:15', name: 'Программирование', meta: 'Соколов В.Г. • 218а' },
                { number: 3, time: '12:15', name: 'История', meta: 'Иванова Е.П. • 210' }
            ]
        }
    },
    teachers: {
        'Ларина М.В.': [
            { number: 1, time: '08:30', name: 'Математический анализ', meta: 'ИС-31, ПО-22 • 402', place: 'лекция' },
            { number: 2, time: '10:15', name: 'Математический анализ', meta: 'ИС-31 • 402', place: 'практика' }
        ],
        'Сухов Д.А.': [
            { number: 2, time: '10:15', name: 'Базы данных', meta: 'ИС-31 • 218б' },
            {
                number: 3, time: '12:15', name: 'Базы данных',
                meta: 'ИС-31, ИС-32 • 315', place: 'лекция',
                changes: {
                    type: 'rescheduled',
                    was: '2 пара (218б)',
                    now: '3 пара (315)'
                }
            }
        ]
    }
};