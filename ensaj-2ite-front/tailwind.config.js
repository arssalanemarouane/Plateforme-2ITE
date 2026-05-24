/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ensaj: {
          primary: '#1E3A8A',    // Bleu Institutionnel
          secondary: '#0F172A',  // Ardoise foncé
          light: '#F8FAFC',      // Fond lumineux de la plateforme
          accent: '#10B981',     // Émeraude (validation, notes)
        }
      }
    },
  },
  plugins: [],
}