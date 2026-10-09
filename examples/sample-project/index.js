function checkLogin(username, password) {
    const validUser = "admin";
    const validPassword = "password123";

    if (username === validUser && password === validPassword) {
        console.log("Welcome admin");
    } else {
        console.log("Invalid login");
    }
}

function findMax(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        throw new Error("Invalid input");
    }

    return numbers.reduce((max, num) => (num > max ? num : max), numbers[0]);
}

const numbers = [5, 10, 2, 8];

checkLogin("admin", "password123");
console.log(findMax(numbers));