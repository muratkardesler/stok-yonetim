<template>
    <div id="app">
      <router-view />
    </div>
  </template>
  
  <script>
  export default {
    name: "App",
  };
  </script>
  
  <style>
  :root {
    --primary-color: #4F46E5;
    --secondary-color: #06B6D4;
    --accent-color: #F59E0B;
    --text-color: #1F2937;
    --light-gray: #F3F4F6;
    --white: #ffffff;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--text-color);
    line-height: 1.5;
    background: var(--light-gray);
  }

  .btn-primary {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .btn-secondary {
    background: var(--light-gray);
    color: var(--text-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .btn-primary:hover,
  .btn-secondary:hover {
    transform: translateY(-2px);
  }
  </style>