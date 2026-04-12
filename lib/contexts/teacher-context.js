"use client";

import { createContext, useContext } from "react";

/**
 * @typedef {Object} Teacher
 * @property {string} id
 * @property {string} supabaseUserId
 * @property {string} name
 * @property {string} email
 * @property {string|null} school
 * @property {string} planType
 * @property {string} createdAt
 */

/** @type {import('react').Context<{teacher: Teacher | null}>} */
const TeacherContext = createContext({ teacher: null });

/**
 * Provider de contexto do professor
 * @param {Object} props
 * @param {Teacher} props.teacher
 * @param {React.ReactNode} props.children
 */
export function TeacherProvider({ teacher, children }) {
  return (
    <TeacherContext.Provider value={{ teacher }}>
      {children}
    </TeacherContext.Provider>
  );
}

/**
 * Hook para acessar dados do professor
 * @returns {{teacher: Teacher | null}}
 */
export function useTeacher() {
  const context = useContext(TeacherContext);
  return context;
}
