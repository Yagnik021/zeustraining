const totalRecords = 1000;
const jsonData = [];
const headers = ["id", "firstName", "lastName", "age", "salary"];
const firstNames = ["Raj", "Amit", "Sneha", "Priya", "Vikas", "Neha", "Anil", "Rita", "Suresh", "Divya"];
const lastNames = ["Solanki", "Mehta", "Sharma", "Verma", "Kapoor", "Joshi", "Reddy", "Yadav", "Chopra", "Patel"];
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomAge() {
    return Math.floor(Math.random() * 30) + 21; // age 21–50
}
function getRandomSalary() {
    return Math.floor(Math.random() * 900000) + 100000; // salary 100K – 1M
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
