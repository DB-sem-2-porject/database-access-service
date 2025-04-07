const promise = new Promise((resolve, reject) => {
    console.log("⏱ Код внутри промиса выполняется прямо сейчас");
    setTimeout(() => {
        resolve("✅ Всё готово");
    }, 1000);
});

console.log("🔄 Промис уже создан, но результат ещё не пришёл");

promise.then(result => {
    console.log("👉 Результат промиса:", result);
});