/**
 * Tipagens JSDoc do projeto MAPI
 *
 * Use estes typedefs para autocomplete e documentação.
 * Exemplo: @param {Student} student
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

/**
 * @typedef {'FREE'|'PREMIUM'|'SCHOOL'} PlanType
 */

/**
 * @typedef {'TEA'|'TDAH'|'TOD'|'DISLEXIA'|'DISCALCULIA'|'ALTAS_HABILIDADES'|'OUTRO'|'NAO_INFORMADO'} DiagnosisType
 */

/**
 * @typedef {'ROWS'|'GROUPS'|'U_SHAPE'|'CUSTOM'} LayoutType
 */

/**
 * @typedef {'KEEP_TOGETHER'|'KEEP_APART'|'NEAR_FRONT'|'NEAR_TEACHER'|'NEAR_EXIT'|'AVOID_WINDOW'} RuleType
 */

/**
 * @typedef {'COMPORTAMENTO'|'CRISE'|'PROGRESSO'|'COMUNICACAO_FAMILIA'|'AVALIACAO'|'OUTRO'} LogCategory
 */

/**
 * @typedef {'PRIVATE'|'SCHOOL'|'FAMILY'} LogVisibility
 */

// ─── Modelos ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} Teacher
 * @property {string} id
 * @property {string} supabaseUserId
 * @property {string} name
 * @property {string} email
 * @property {string|null} school
 * @property {PlanType} planType
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} Class
 * @property {string} id
 * @property {string} teacherId
 * @property {string} name
 * @property {string|null} subject
 * @property {string} year
 * @property {string|null} period
 * @property {boolean} isArchived
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} ClassWithStudentCount
 * @property {string} id
 * @property {string} teacherId
 * @property {string} name
 * @property {string|null} subject
 * @property {string} year
 * @property {string|null} period
 * @property {boolean} isArchived
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 * @property {number} _count - { students: number }
 */

/**
 * @typedef {Object} ClassWithStudents
 * @property {string} id
 * @property {string} teacherId
 * @property {string} name
 * @property {string|null} subject
 * @property {string} year
 * @property {string|null} period
 * @property {boolean} isArchived
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 * @property {Student[]} students
 */

/**
 * @typedef {Object} Student
 * @property {string} id
 * @property {string} classId
 * @property {string} name
 * @property {boolean} hasAccessibilityNeeds
 * @property {DiagnosisType|null} diagnosisType
 * @property {string|null} diagnosisNotes
 * @property {boolean} prioritySeating
 * @property {boolean} parentConsent
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 */

/**
 * @typedef {Object} StudentWithRules
 * @property {string} id
 * @property {string} classId
 * @property {string} name
 * @property {boolean} hasAccessibilityNeeds
 * @property {DiagnosisType|null} diagnosisType
 * @property {string|null} diagnosisNotes
 * @property {boolean} prioritySeating
 * @property {boolean} parentConsent
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string|null} deletedAt
 * @property {SeatingRule[]} rulesAsStudentA
 * @property {SeatingRule[]} rulesAsStudentB
 */

/**
 * @typedef {Object} SeatingMap
 * @property {string} id
 * @property {string} classId
 * @property {string} name
 * @property {LayoutType} layoutType
 * @property {Object} layoutConfig
 * @property {boolean} isActive
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} StudentPosition
 * @property {string} id
 * @property {string} seatingMapId
 * @property {string} studentId
 * @property {number} positionX
 * @property {number} positionY
 * @property {string} deskId
 */

/**
 * @typedef {Object} SeatingRule
 * @property {string} id
 * @property {string} classId
 * @property {RuleType} ruleType
 * @property {string} studentAId
 * @property {string|null} studentBId
 * @property {number} priority
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} AccessibilityLog
 * @property {string} id
 * @property {string} studentId
 * @property {string} teacherId
 * @property {string} logDate
 * @property {LogCategory} category
 * @property {string} description
 * @property {LogVisibility} visibility
 * @property {string} createdAt
 */

// ─── DTOs / Inputs ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} CreateClassInput
 * @property {string} name
 * @property {string} [subject]
 * @property {string} [year]
 * @property {string} [period]
 */

/**
 * @typedef {Object} UpdateClassInput
 * @property {string} [name]
 * @property {string} [subject]
 * @property {string} [year]
 * @property {string} [period]
 * @property {boolean} [isArchived]
 */

/**
 * @typedef {Object} CreateStudentInput
 * @property {string} name
 * @property {boolean} [hasAccessibilityNeeds]
 * @property {DiagnosisType|null} [diagnosisType]
 * @property {string|null} [diagnosisNotes]
 * @property {boolean} [prioritySeating]
 * @property {boolean} [parentConsent]
 */

/**
 * @typedef {Object} UpdateStudentInput
 * @property {string} [name]
 * @property {boolean} [hasAccessibilityNeeds]
 * @property {DiagnosisType|null} [diagnosisType]
 * @property {string|null} [diagnosisNotes]
 * @property {boolean} [prioritySeating]
 * @property {boolean} [parentConsent]
 */

/**
 * @typedef {Object} CSVStudentRow
 * @property {string} nome
 * @property {boolean} necessidades
 * @property {DiagnosisType|null} diagnostico
 * @property {string|null} obs
 */

/**
 * @typedef {Object} ImportResult
 * @property {number} created
 * @property {string[]} errors
 */

// ─── Result Pattern ──────────────────────────────────────────────────────────

/**
 * @template T
 * @typedef {Object} Result
 * @property {T|null} data
 * @property {string|null} error
 */

// ─── UI Types ────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} LayoutOption
 * @property {LayoutType} value
 * @property {string} label
 * @property {string} icon
 */

/**
 * @typedef {Object} ConditionGuide
 * @property {string} condition
 * @property {string} description
 * @property {string[]} whatToDo
 * @property {string[]} whatNotToDo
 * @property {string[]} familyCommunication
 * @property {string[]} whenToEscalate
 * @property {string} disclaimer
 */

/**
 * @typedef {Object} DraggableStudent
 * @property {string} id
 * @property {string} name
 * @property {DiagnosisType|null} diagnosisType
 * @property {boolean} hasAccessibilityNeeds
 */

/**
 * @typedef {Object} DeskPosition
 * @property {string} deskId
 * @property {number} x
 * @property {number} y
 * @property {DraggableStudent|null} student
 */

export { };
