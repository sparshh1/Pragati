import { Student } from '@/types';

export const students: Student[] = [
  {
    id: 'stu-01',
    name: 'Rahul Deshmukh',
    districtId: 'pune',
    enrolledCourseId: 'pune-mmv-01', // Mechanic Motor Vehicle
    informalExperience: [],
    currentNsqfLevel: 2
  },
  {
    id: 'stu-02',
    name: 'Priya Kadam',
    districtId: 'pune',
    enrolledCourseId: 'pune-ev-01', // Advanced EV Technician
    informalExperience: [
      {
        skillTag: 'ice-engine-overhaul',
        yearsOfExperience: 1,
        toolsUsed: ['Wrench', 'Diagnostic Scanner']
      }
    ],
    currentNsqfLevel: 3
  },
  {
    id: 'stu-03',
    name: 'Amit Patil',
    districtId: 'nashik',
    enrolledCourseId: 'nsk-ana-01', // Analog Electronics Repair (Declining)
    informalExperience: [],
    currentNsqfLevel: 2
  },
  {
    id: 'stu-04',
    name: 'Sneha Jadhav',
    districtId: 'nashik',
    enrolledCourseId: null,
    informalExperience: [
      {
        skillTag: 'sewing-machine-operation',
        yearsOfExperience: 4,
        toolsUsed: ['Industrial Sewing Machine', 'Overlock Machine']
      }
    ],
    currentNsqfLevel: 1
  },
  {
    id: 'stu-05',
    name: 'Sanjay Pawar',
    districtId: 'nashik',
    enrolledCourseId: 'nsk-solar-01', // Solar
    informalExperience: [],
    currentNsqfLevel: 3
  },
  {
    id: 'stu-06',
    name: 'Vijay Bhosale',
    districtId: 'csn',
    enrolledCourseId: null,
    informalExperience: [
      {
        skillTag: 'automotive-welding',
        yearsOfExperience: 5,
        toolsUsed: ['MIG Welder', 'Arc Welder', 'Grinder']
      }
    ],
    currentNsqfLevel: 2
  },
  {
    id: 'stu-07',
    name: 'Pooja Shinde',
    districtId: 'csn',
    enrolledCourseId: 'csn-data-01', // Data Entry
    informalExperience: [],
    currentNsqfLevel: 2
  },
  {
    id: 'stu-08',
    name: 'Ganesh Joshi',
    districtId: 'nagpur',
    enrolledCourseId: 'ngp-handloom-01', // Handloom Weaver (Declining)
    informalExperience: [],
    currentNsqfLevel: 1
  },
  {
    id: 'stu-09',
    name: 'Meena Kulkarni',
    districtId: 'nagpur',
    enrolledCourseId: 'ngp-ev-01', // EV Charging
    informalExperience: [],
    currentNsqfLevel: 3
  },
  {
    id: 'stu-10',
    name: 'Suresh Gaikwad',
    districtId: 'thane',
    enrolledCourseId: null,
    informalExperience: [
      {
        skillTag: 'plumbing',
        yearsOfExperience: 3,
        toolsUsed: ['Pipe Wrench', 'Threader']
      },
      {
        skillTag: 'masonry',
        yearsOfExperience: 2,
        toolsUsed: ['Trowel', 'Level']
      }
    ],
    currentNsqfLevel: 2
  },
  {
    id: 'stu-11',
    name: 'Aishwarya Chavan',
    districtId: 'thane',
    enrolledCourseId: 'tha-ware-01', // Warehouse
    informalExperience: [],
    currentNsqfLevel: 2
  },
  {
    id: 'stu-12',
    name: 'Ramesh More',
    districtId: 'kolhapur',
    enrolledCourseId: 'kol-loom-01', // Power Loom
    informalExperience: [],
    currentNsqfLevel: 2
  },
  {
    id: 'stu-13',
    name: 'Anita Kamble',
    districtId: 'kolhapur',
    enrolledCourseId: null,
    informalExperience: [
      {
        skillTag: 'digital-marketing',
        yearsOfExperience: 2,
        toolsUsed: ['Facebook Ads', 'Google Analytics']
      }
    ],
    currentNsqfLevel: 3
  },
  {
    id: 'stu-14',
    name: 'Vikram Sawant',
    districtId: 'pune',
    enrolledCourseId: 'pune-drone-01', // Drone Survey
    informalExperience: [],
    currentNsqfLevel: 4
  },
  {
    id: 'stu-15',
    name: 'Neha Thakur',
    districtId: 'csn',
    enrolledCourseId: 'csn-cnc-01', // Diploma Mechatronics
    informalExperience: [],
    currentNsqfLevel: 4
  }
];

export function getStudent(id: string): Student | undefined {
  return students.find(s => s.id === id);
}

export function getStudentsByDistrict(districtId: string): Student[] {
  return students.filter(s => s.districtId === districtId);
}
