/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      // Cores personalizadas para o tema
      colors: {
        'poker-blue': '#3f51b5',
        'poker-light': '#e8eaf6',
      },
      // Definição de animações
      keyframes: {
        // Efeito de aparecer gradualmente
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        // Efeito de pulsar expandindo
        ping: {
          '0%': { transform: 'scale(1)', opacity: 1 },
          '75%, 100%': {
            transform: 'scale(2.5)',
            opacity: 0,
          },
        },
        // Efeito de pulsar opacity
        pulse: {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.3,
          },
        },
      },
      // Configuração das animações
      animation: {
        'fade-in': 'fade-in 0.3s ease-in',
        ping: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
        pulse: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
};
