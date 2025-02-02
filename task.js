/*
Задание 1: Создание и миграция таблиц

Создайте таблицу Comments, которая будет иметь следующие поля:

id: уникальный идентификатор комментария (INTEGER, автоинкремент, первичный ключ)
content: текст комментария (TEXT, не может быть пустым)
userId: идентификатор пользователя, который оставил комментарий (INTEGER, внешний ключ на таблицу Users)
postId: идентификатор поста, к которому относится комментарий (INTEGER, внешний ключ на таблицу Posts)
createdAt: дата создания комментария (DATE, по умолчанию текущая дата)

Установите связи между таблицами Users, Posts и Comments:

Один пользователь может оставить много комментариев (hasMany).
Один пост может иметь много комментариев (hasMany).

Задание 2: CRUD операции

Реализуйте функции для выполнения CRUD (Create, Read, Update, Delete) операций для таблицы Posts:

Создание нового поста.
Получение всех постов.
Обновление поста по его id.
Удаление поста по его id.

Реализуйте аналогичные функции для таблицы Comments.

Задание 3: Поиск и фильтрация

Реализуйте функцию, которая будет возвращать все посты определенного пользователя по его userId.
Реализуйте функцию, которая будет возвращать все комментарии к определенному посту по его postId.

Задание 4: Агрегация данных

Реализуйте функцию, которая будет возвращать количество постов, созданных каждым пользователем.
Реализуйте функцию, которая будет возвращать количество комментариев для каждого поста.

Задание 5: Валидация данных

Добавьте валидацию для полей email и password в таблице Users:
Убедитесь, что email имеет правильный формат.
Убедитесь, что password имеет минимальную длину (например, 6 символов).

Задание 6: Асинхронные операции

Используйте асинхронные функции для выполнения всех операций CRUD, чтобы избежать коллбеков и сделать код более читаемым.
Обработайте возможные ошибки при выполнении операций с базой данных.

Задание 7: Связанные данные

Реализуйте функцию, которая будет возвращать пользователя вместе с его постами и комментариями.
Реализуйте функцию, которая будет возвращать пост вместе с его комментариями и пользователем, который его создал.
*/
