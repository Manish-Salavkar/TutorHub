import { DataThresholding, Engineering, Code, Language, TableChart, SettingsApplications } from '@mui/icons-material'
import ArchitectureIcon from '@mui/icons-material/Architecture';

const courses = {
    "IT": [
        {
            "name": "Data Analytics",
            "icon": DataThresholding
        },
        {
            "name": "Java",
            "icon": Code
        },
        {
            "name": "Python",
            "icon": Language
        },
        {
            "name": "Excel",
            "icon": TableChart
        }
    ],
    "Mechanical": [
        {
            "name": "AutoCad",
            "icon": ArchitectureIcon
        },
        {
            "name": "SolidWorks",
            "icon": Engineering
        },
        {
            "name": "Ansys",
            "icon": SettingsApplications
        }
    ]
};

export { courses };
