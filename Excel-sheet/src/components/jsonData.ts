const totalRecords = 100000;
const jsonData : any[] = [];

const headers = ["id", "firstName", "lastName", "age", "salary"];

const firstNames = ["Raj", "Amit", "Sneha", "Priya", "Vikas", "Neha", "Anil", "Rita", "Suresh", "Divya"];
const lastNames = ["Solanki", "Mehta", "Sharma", "Verma", "Kapoor", "Joshi", "Reddy", "Yadav", "Chopra", "Patel"];

function getRandomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomAge(): number {
    return Math.floor(Math.random() * 30) + 21; // age 21–50
}

function getRandomSalary(): number {
    return Math.floor(Math.random() * 90000) + 10000; 
}

for (let i = 1; i <= totalRecords; i++) {
    jsonData.push({
        id: i,
        firstName: getRandomItem(firstNames),
        lastName: getRandomItem(lastNames),
        age: getRandomAge(),
        salary: getRandomSalary()
    });
}


export { jsonData, headers };