# Используем официальный образ Node.js как базовый
FROM node:18

# Создаём рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код приложения в контейнер
COPY . .

# Открываем порт для связи с приложением
EXPOSE 1338

# Команда для запуска приложения
CMD ["node", "index.js"]
