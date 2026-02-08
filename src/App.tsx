import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainMatrix from './components/matrix/MainMatrix'
import ReportViewer from './components/reports/ReportViewer'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMatrix />} />
        <Route path="/report/:reportId" element={<ReportViewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App