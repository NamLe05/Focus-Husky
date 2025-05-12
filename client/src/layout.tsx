import React from 'react';
import { Routes, Route } from "react-router";


const Layout: React.FC = ({ children }) => {
  <Routes>
    <Route element={<MarketingLayout />}>
      <Route index element={<MarketingHome />} />
      <Route path="contact" element={<Contact />} />
    </Route>

    <Route path="projects">
      <Route index element={<ProjectsHome />} />
      <Route element={<ProjectsLayout />}>
        <Route path=":pid" element={<Project />} />
        <Route path=":pid/edit" element={<EditProject />} />
      </Route>
    </Route>
  </Routes>
};