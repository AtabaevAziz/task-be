# Архитектура backend для сайта университета

Этот документ можно использовать как учебную основу для нового backend-проекта сайта университета на `NestJS`.

Представь сайт университета, где можно добавлять студентов, смотреть их список, удалять их и позже расширять систему курсами, преподавателями и записями на обучение.

## Как все связано

```text
Клиент отправляет запрос
        ↓
Controller принимает запрос
        ↓
DTO проверяет данные
        ↓
Service выполняет логику
        ↓
Entity работает с таблицей базы данных
        ↓
Ответ возвращается клиенту
```

Это базовая схема для понимания того, как проходит один запрос через backend.

Важно: блок с `Entity` ниже показан в стиле `NestJS + TypeORM`. Если проект строится на `NestJS + Prisma`, вместо отдельного `entity`-класса обычно используется `model` в `prisma/schema.prisma`. Оба варианта разобраны ниже.

## 1. Controller — принимает запросы

Контроллер похож на администратора на входе. Он понимает, какой запрос пришел, забирает из него данные и передает работу дальше в сервис.

Например:

- `GET /students` — показать студентов
- `POST /students` — добавить студента
- `DELETE /students/1` — удалить студента

```ts
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }
}
```

`Controller` не должен выполнять всю работу сам. Он принимает запрос и передает его сервису.

В `NestJS` контроллеры отвечают за:

- обработку входящих HTTP-запросов
- чтение `body`, `params`, `query`
- вызов нужного `service`
- возврат ответа клиенту

Что обычно держат в `controller`:

- маршруты `@Get()`, `@Post()`, `@Put()`, `@Delete()`
- декораторы `@Body()`, `@Param()`, `@Query()`
- guard, interceptor, pipe на уровне API

Чего там быть не должно:

- сложной бизнес-логики
- прямой работы с базой данных
- длинных проверок правил предметной области

## 2. DTO — описывает входящие данные

`DTO` расшифровывается как `Data Transfer Object`.

Простыми словами: `DTO` говорит, какие данные разрешено прислать на сервер.

Например, для создания студента нужны имя и возраст:

```ts
export class CreateStudentDto {
  name: string;
  age: number;
}
```

Клиент отправляет:

```json
{
  "name": "Алишер",
  "age": 16
}
```

Можно добавить проверку:

```ts
import { IsInt, IsString, Min } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(6)
  age: number;
}
```

Теперь сервер не примет такое:

```json
{
  "name": 100,
  "age": -5
}
```

В `NestJS` `DTO` часто используют вместе с `ValidationPipe`, чтобы проверять входящие данные до того, как они попадут в сервис.

Что обычно делает `DTO`:

- описывает форму входных данных
- ограничивает, какие поля можно принимать
- валидирует типы и простые правила
- делает API понятнее и безопаснее

Чего `DTO` обычно не делает:

- не ходит в базу
- не проверяет сложные бизнес-правила
- не решает, можно ли по смыслу создавать запись

Например, `DTO` может проверить, что `age` это число больше `6`, но не должен сам решать, можно ли студенту записаться на курс без выполненных prerequisites. Это уже задача `service`.

## 3. Service — выполняет основную работу

`Service` — это "мозг" приложения.

Именно сервис:

- добавляет студента
- ищет студентов
- проверяет правила
- обращается к базе данных
- удаляет или изменяет данные

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentsService {
  private students = [];

  create(dto: CreateStudentDto) {
    const student = {
      id: Date.now(),
      ...dto,
    };

    this.students.push(student);

    return student;
  }

  findAll() {
    return this.students;
  }
}
```

Контроллер говорит:

```ts
this.studentsService.create(dto);
```

А сервис уже решает, как именно создать студента.

В `NestJS` сервис обычно является `provider`: Nest создает его и передает в другие классы через `dependency injection`.

Что обычно живет в `service`:

- бизнес-логика
- проверки предметной области
- вызовы репозитория, ORM или Prisma client
- преобразование данных перед ответом

Примеры бизнес-логики для сайта университета:

- нельзя записать студента на курс, если курс закрыт
- нельзя удалить преподавателя, если за ним закреплены активные курсы
- нельзя создать студента с уже занятым университетским email

## 4. Entity — описание таблицы базы данных

`Entity` показывает, как объект хранится в базе данных.

Это пример в стиле `TypeORM`:

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;
}
```

Это примерно соответствует таблице:

| id | name    | age |
| --- | ------- | --- |
| 1   | Алишер  | 16  |
| 2   | Анна    | 18  |

То есть:

- `id: number` становится колонкой `id`
- `name: string` становится колонкой `name`
- `age: number` становится колонкой `age`

В `TypeORM` `entity` — это класс, связанный с таблицей базы данных.

Что обычно хранится в `entity`:

- поля таблицы
- индексы
- связи между таблицами
- иногда ORM-специфичные декораторы и metadata

Чего там обычно не должно быть:

- HTTP-логики
- контроллерной логики
- внешней валидации запроса

## 5. Model — общая модель данных

Слово `model` используют по-разному, поэтому здесь важно не путаться.

В некоторых проектах `model` — это просто описание объекта внутри программы:

```ts
export interface StudentModel {
  id: number;
  name: string;
  age: number;
}
```

Но при использовании `TypeORM` роль модели часто выполняет `Entity`.

То есть иногда:

`Model ≈ Entity`

Однако разница в идее такая:

- `Model` — как данные выглядят в программе
- `Entity` — как данные сохраняются в базе
- `DTO` — какие данные принимаем или отправляем

Например:

```ts
// DTO: клиент присылает это
class CreateStudentDto {
  name: string;
  age: number;
}

// Entity: это хранится в базе
class StudentEntity {
  id: number;
  name: string;
  age: number;
  createdAt: Date;
}

// Model: представление студента внутри программы
interface StudentModel {
  id: number;
  name: string;
  age: number;
}
```

## Полный путь одного запроса

Клиент отправляет:

```http
POST /students
```

```json
{
  "name": "Алишер",
  "age": 16
}
```

Дальше происходит следующее:

1. `Controller` принимает `POST /students`.
2. `DTO` проверяет `name` и `age`.
3. `Service` создает студента.
4. `Entity` сохраняется в базе.
5. `Controller` возвращает результат.

В коде это выглядит примерно так:

```ts
// DTO
export class CreateStudentDto {
  name: string;
  age: number;
}

// Entity
@Entity()
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;
}

// Service
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  create(dto: CreateStudentDto) {
    const student = this.studentRepository.create(dto);

    return this.studentRepository.save(student);
  }

  findAll() {
    return this.studentRepository.find();
  }
}

// Controller
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }
}
```

## То же самое, но для Prisma

Если новый backend университета строится на `NestJS + Prisma`, отдельный `entity`-класс обычно не нужен. Его роль выполняет `model` в `prisma/schema.prisma`.

Пример:

```prisma
model Student {
  id        String   @id @default(cuid())
  name      String
  age       Int
  email     String   @unique
  createdAt DateTime @default(now())
}
```

Тогда путь запроса выглядит почти так же:

```text
Клиент -> Controller -> DTO -> Service -> Prisma model -> Database -> Ответ
```

Пример сервиса с Prisma:

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateStudentDto) {
    return this.prisma.student.create({
      data: {
        name: dto.name,
        age: dto.age,
        email: dto.email,
      },
    });
  }

  findAll() {
    return this.prisma.student.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
```

Здесь различие такое:

- в `TypeORM` сервис работает с `Repository<Student>`
- в `Prisma` сервис работает с `this.prisma.student`

Но архитектурная идея остается той же:

- `controller` принимает запрос
- `dto` валидирует данные
- `service` выполняет бизнес-логику
- ORM или Prisma сохраняет данные в базе

## Где что лежит в проекте университета

Пример удобной структуры нового backend-проекта:

```text
src/
  students/
    dto/
      create-student.dto.ts
      update-student.dto.ts
    students.controller.ts
    students.service.ts
    students.module.ts
  courses/
    dto/
    courses.controller.ts
    courses.service.ts
    courses.module.ts
  teachers/
    dto/
    teachers.controller.ts
    teachers.service.ts
    teachers.module.ts
  database/
    prisma.service.ts
prisma/
  schema.prisma
```

Если проект на `TypeORM`, то в модуле `students` еще часто появляется:

```text
students.entity.ts
```

Если проект на `Prisma`, отдельного `students.entity.ts` обычно нет.

## Как разделять ответственность правильно

Используй такое правило:

- `Controller` — получает запрос и возвращает ответ
- `DTO` — проверяет форму и базовую корректность данных
- `Service` — решает, что именно делать по бизнес-правилам
- `Entity` или `Prisma model` — описывает, как данные хранятся
- `Model` — описывает данные в коде, если нужен отдельный внутренний тип

Хорошие примеры для университетского сайта:

- `CreateStudentDto` принимает `name`, `age`, `email`
- `StudentsService` проверяет, нет ли такого `email` уже в системе
- `Student` entity или Prisma model хранит `id`, `name`, `age`, `email`, `createdAt`
- `StudentsController` предоставляет `POST /students`, `GET /students`, `DELETE /students/:id`

Плохие примеры:

- писать SQL или Prisma-запросы прямо в `controller`
- делать в `DTO` запросы в базу
- хранить в `entity` правила HTTP API
- смешивать модель ответа API и схему таблицы без причины

## Самая простая шпаргалка

- `Controller` — принимает запрос
- `DTO` — проверяет входящие данные
- `Service` — выполняет логику
- `Entity` — описывает таблицу базы
- `Model` — описывает данные в программе

И еще проще:

- `Controller` -> куда пришел запрос?
- `DTO` -> правильные ли данные?
- `Service` -> что нужно сделать?
- `Entity` -> как сохранить это в базе?
- `Model` -> как выглядит объект?

## Что лучше выбрать для нового проекта

Если ты делаешь новый backend сайта университета именно в стиле этого репозитория, то практичный вариант такой:

- `NestJS` для модульной структуры и API
- `DTO` для валидации входящих данных
- `Service` для бизнес-логики
- `Prisma` для доступа к базе
- `model` в `schema.prisma` вместо отдельных `entity`-классов

То есть для нового проекта на основе этого репозитория лучше думать так:

```text
Controller -> DTO -> Service -> Prisma model -> Database
```

А блоки с `Entity` полезно знать как общую теорию и как паттерн для `TypeORM`-проектов.
