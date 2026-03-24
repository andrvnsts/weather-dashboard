# Weather Dashboard

Pet-project frontend-приложение для отображения текущей погоды и прогноза с поддержкой поиска города, геолокации, темы и сохранения пользовательских настроек.

## О проекте

Это weather dashboard, реализованный на React. Проект был сделан не только как верстка по макету, но и как полноценное frontend-приложение с реальной логикой, работой с API, пользовательскими сценариями и тестами.

## Функциональность

- поиск города
- отображение текущей погоды
- 5-day forecast
- hourly forecast
- получение погоды по текущей геолокации
- light / dark theme
- сохранение темы в `localStorage`
- сохранение последнего выбранного города
- история последних поисков
- loading и error states
- unit tests

## Технологии

- React
- Vite
- JavaScript
- CSS
- Vitest
- React Testing Library
- Open-Meteo API

## Структура проекта

```text
src/
  assets/
    icons/
  services/
    weatherApi.js
    weatherApi.test.js
  utils/
    storage.js
    storage.test.js
    formatters.js
    formatters.test.js
  App.jsx
  main.jsx
```


# Weather Dashboard

A pet-project frontend application for displaying current weather and forecast with support for city search, geolocation, theme switching, and user preferences persistence.

## About the Project

This is a weather dashboard built with React. The goal was not only to create a UI based on a design, but also to implement a full-featured frontend application with real logic, API integration, user scenarios, and testing.

## Features

- city search  
- current weather display  
- 5-day forecast  
- hourly forecast  
- weather based on user geolocation  
- light / dark theme  
- theme persistence via `localStorage`  
- last selected city persistence  
- recent search history  
- loading and error states  
- unit tests  

## Technologies

- React  
- Vite  
- JavaScript  
- CSS  
- Vitest  
- React Testing Library  
- Open-Meteo API  

## Project Structure

```text
src/
  assets/
    icons/
  services/
    weatherApi.js
    weatherApi.test.js
  utils/
    storage.js
    storage.test.js
    formatters.js
    formatters.test.js
  App.jsx
  main.jsx