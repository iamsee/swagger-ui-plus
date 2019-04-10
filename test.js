const J = (n) => n === 0 ? 1 : J(n-1) + 1
console.log(J(100000))
