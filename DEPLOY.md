[3/3] Starting server...
▲ Next.js 16.1.6
- Local:         http://c084901d732a:3000
- Network:       http://c084901d732a:3000

✓ Starting...
✓ Ready in 89ms
Get settings error: Error [PrismaClientValidationError]: 
Invalid `prisma.userSetting.findUnique()` invocation:

{
  where: {
    userId: undefined,
?   id?: String,
?   AND?: UserSettingWhereInput | UserSettingWhereInput[],
?   OR?: UserSettingWhereInput[],
?   NOT?: UserSettingWhereInput | UserSettingWhereInput[],
?   userNickname?: StringNullableFilter | String | Null,
?   userAvatar?: StringNullableFilter | String | Null,
?   sessionHistory?: JsonNullableFilter,
?   createdAt?: DateTimeFilter | DateTime,
?   updatedAt?: DateTimeFilter | DateTime,
?   user?: UserScalarRelationFilter | UserWhereInput
  }
}

Argument `where` of type UserSettingWhereUniqueInput needs at least one of `id` or `userId` arguments. Available options are marked with ?.
    at async m (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:1329)
    at async d (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:5087) {
  clientVersion: '6.5.0'
}
Get settings error: Error [PrismaClientValidationError]: 
Invalid `prisma.userSetting.findUnique()` invocation:

{
  where: {
    userId: undefined,
?   id?: String,
?   AND?: UserSettingWhereInput | UserSettingWhereInput[],
?   OR?: UserSettingWhereInput[],
?   NOT?: UserSettingWhereInput | UserSettingWhereInput[],
?   userNickname?: StringNullableFilter | String | Null,
?   userAvatar?: StringNullableFilter | String | Null,
?   sessionHistory?: JsonNullableFilter,
?   createdAt?: DateTimeFilter | DateTime,
?   updatedAt?: DateTimeFilter | DateTime,
?   user?: UserScalarRelationFilter | UserWhereInput
  }
}

Argument `where` of type UserSettingWhereUniqueInput needs at least one of `id` or `userId` arguments. Available options are marked with ?.
    at async m (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:1329)
    at async d (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:5087) {
  clientVersion: '6.5.0'
}
Update document error: Error [PrismaClientValidationError]: 
Invalid `prisma.document.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: DocumentWhereInput | DocumentWhereInput[],
?   OR?: DocumentWhereInput[],
?   NOT?: DocumentWhereInput | DocumentWhereInput[],
?   title?: StringFilter | String,
?   content?: StringFilter | String,
?   category?: StringFilter | String,
?   author?: StringFilter | String,
?   isPinned?: BoolFilter | Boolean,
?   createdAt?: DateTimeFilter | DateTime,
?   updatedAt?: DateTimeFilter | DateTime
  },
  data: {
    title: undefined,
    content: "# 公会房规\n\n## 总则\n\n1. 尊重每一位冒险者\n2. 保持游戏氛围友好\n3. 准时参加冒险\n\n## 惩罚措施",
    category: undefined,
    isPinned: undefined
  }
}

Argument `where` of type DocumentWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.
    at async w (.next/server/chunks/[root-of-the-server]__896a5511._.js:1:1382)
    at async d (.next/server/chunks/[root-of-the-server]__896a5511._.js:1:4878) {
  clientVersion: '6.5.0'
}
Get settings error: Error [PrismaClientValidationError]: 
Invalid `prisma.userSetting.findUnique()` invocation:

{
  where: {
    userId: undefined,
?   id?: String,
?   AND?: UserSettingWhereInput | UserSettingWhereInput[],
?   OR?: UserSettingWhereInput[],
?   NOT?: UserSettingWhereInput | UserSettingWhereInput[],
?   userNickname?: StringNullableFilter | String | Null,
?   userAvatar?: StringNullableFilter | String | Null,
?   sessionHistory?: JsonNullableFilter,
?   createdAt?: DateTimeFilter | DateTime,
?   updatedAt?: DateTimeFilter | DateTime,
?   user?: UserScalarRelationFilter | UserWhereInput
  }
}

Argument `where` of type UserSettingWhereUniqueInput needs at least one of `id` or `userId` arguments. Available options are marked with ?.
    at async m (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:1329)
    at async d (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:5087) {
  clientVersion: '6.5.0'
}
Get settings error: Error [PrismaClientValidationError]: 
Invalid `prisma.userSetting.findUnique()` invocation:

{
  where: {
    userId: undefined,
?   id?: String,
?   AND?: UserSettingWhereInput | UserSettingWhereInput[],
?   OR?: UserSettingWhereInput[],
?   NOT?: UserSettingWhereInput | UserSettingWhereInput[],
?   userNickname?: StringNullableFilter | String | Null,
?   userAvatar?: StringNullableFilter | String | Null,
?   sessionHistory?: JsonNullableFilter,
?   createdAt?: DateTimeFilter | DateTime,
?   updatedAt?: DateTimeFilter | DateTime,
?   user?: UserScalarRelationFilter | UserWhereInput
  }
}

Argument `where` of type UserSettingWhereUniqueInput needs at least one of `id` or `userId` arguments. Available options are marked with ?.
    at async m (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:1329)
    at async d (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:5087) {
  clientVersion: '6.5.0'
}
Update document error: Error [PrismaClientValidationError]: 
Invalid `prisma.document.update()` invocation:

{
  where: {
    id: undefined,
?   AND?: DocumentWhereInput | DocumentWhereInput[],
?   OR?: DocumentWhereInput[],
?   NOT?: DocumentWhereInput | DocumentWhereInput[],
?   title?: StringFilter | String,
?   content?: StringFilter | String,
?   category?: StringFilter | String,
?   author?: StringFilter | String,
?   isPinned?: BoolFilter | Boolean,
?   createdAt?: DateTimeFilter | DateTime,
?   updatedAt?: DateTimeFilter | DateTime
  },
  data: {
    title: undefined,
    content: "# 公会房规\n\n## 总则\n\n1. 尊重每一位冒险者\n2. 保持游戏氛围友好\n3. 准时参加冒险\n\n## 惩罚措施\n\n",
    category: undefined,
    isPinned: undefined
  }
}

Argument `where` of type DocumentWhereUniqueInput needs at least one of `id` arguments. Available options are marked with ?.
    at async w (.next/server/chunks/[root-of-the-server]__896a5511._.js:1:1382)
    at async d (.next/server/chunks/[root-of-the-server]__896a5511._.js:1:4878) {
  clientVersion: '6.5.0'
}
Get settings error: Error [PrismaClientValidationError]: 
Invalid `prisma.userSetting.findUnique()` invocation:

{
  where: {
    userId: undefined,
?   id?: String,
?   AND?: UserSettingWhereInput | UserSettingWhereInput[],
?   OR?: UserSettingWhereInput[],
?   NOT?: UserSettingWhereInput | UserSettingWhereInput[],
?   userNickname?: StringNullableFilter | String | Null,
?   userAvatar?: StringNullableFilter | String | Null,
?   sessionHistory?: JsonNullableFilter,
?   createdAt?: DateTimeFilter | DateTime,
?   updatedAt?: DateTimeFilter | DateTime,
?   user?: UserScalarRelationFilter | UserWhereInput
  }
}

Argument `where` of type UserSettingWhereUniqueInput needs at least one of `id` or `userId` arguments. Available options are marked with ?.
    at async m (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:1329)
    at async d (.next/server/chunks/[root-of-the-server]__a83f714c._.js:1:5087) {
  clientVersion: '6.5.0'
}
