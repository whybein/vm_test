const items = ["coke", "water", "coffee"];
const priceItems = {
  coke: 1100,
  water: 600,
  coffee: 700,
};
const stockItems = {
  coke: Math.floor(Math.random() * 10),
  water: Math.floor(Math.random() * 10),
  coffee: Math.floor(Math.random() * 10),
};
console.log("stockItems", stockItems);

const paymentMethod = ["cash", "card"];
const cashType = [100, 500, 1000, 5000, 10000];

// 구매자 현금 선택 함수
function selectCash(price, currentCash = {}) {
  let cashAvailable = [];
  for (const [key, value] of Object.entries(currentCash)) {
    if (value > 0) {
      cashAvailable.push(Number(key));
    }
  }
  const cash = cashAvailable.reduce((prev, curr) =>
    Math.abs(curr - price) < Math.abs(prev - price) ? curr : prev
  );

  return cash;
}

// 잔돈 조합 함수
function changeMixture(change, currentCash) {
  let changeDetail = {};
  const availableCash = Object.keys(currentCash)
    .map(Number)
    .sort((a, b) => b - a); // 큰 금액부터 잔돈 계산

  for (const cashType of availableCash) {
    const count = Math.floor(change / cashType);
    if (count > 0 && currentCash[cashType] >= count) {
      changeDetail[cashType] = count;
      change -= cashType * count;
    }
  }

  // 잔돈을 정확히 줄 수 없으면 false 반환
  if (change > 0) {
    return false;
  }

  return changeDetail;
}

// 자판기 동작 함수
function purchaseDrink(
  drinkName,
  paymentMethod,
  cardBalance = 0,
  cashCustomer,
  cashMachine
) {
  // 음료 가격 및 재고 확인
  const price = priceItems[drinkName];
  const stockRemain = stockItems[drinkName];
  if (!price || stockRemain === 0) {
    return "해당 음료가 없습니다.";
  }

  // 결제 방식에 따른 처리
  if (paymentMethod === "cash") {
    console.log("\n\n----- 현금 결제 -----");
    console.log("cashCustomer", cashCustomer);
    console.log("cashMachine", cashMachine);
    let totalCashInput = 0;

    while (totalCashInput < price) {
      const priceRemain = price - totalCashInput;
      const cash = selectCash(price, cashCustomer);
      totalCashInput += cash;
      console.log(`\n${cash}원을 투입합니다. 총 투입 금액${totalCashInput}`);
      cashCustomer[cash] -= 1;
      cashMachine[cash] += 1;
      console.log("cashCustomerNow", cashCustomer);
      console.log("cashMachineNow", cashMachine);
    }

    // 잔돈 계산
    let change = totalCashInput - price;

    // 잔돈을 줄 수 있는지 확인
    const changeDetail = changeMixture(change, cashMachine);
    if (!changeDetail) {
      // 투입된 돈을 반환
      for (const [cashType, count] of Object.entries(changeDetail)) {
        cashMachine[cashType] -= count;
        cashCustomer[cashType] += count;
      }

      return {
        message:
          "잔돈이 부족해 투입된 금액을 반환합니다. 다른 결제 수단을 사용해 주세요.",
        change: changeMixture(totalCashInput, cashMachine),
        customer: cashCustomer,
        machine: cashMachine,
      };
    }

    // 잔돈을 자판기에서 차감
    for (const [cashType, count] of Object.entries(changeDetail)) {
      cashMachine[cashType] -= count;
      cashCustomer[cashType] += count;
    }

    // 구매 완료 메시지와 잔돈 정보 반환
    return {
      message: `${drinkName} 구매가 완료되었습니다. (현금결제 완료)`,
      change: changeDetail,
      customer: cashCustomer,
      machine: cashMachine,
    };
  } else if (paymentMethod === "card") {
    console.log("\n\n----- 카드 결제 -----");
    // 카드 결제 로직
    if (!cardBalance) {
      return "유효하지 않은 카드입니다.";
    }

    // 카드 잔액 확인
    if (cardBalance < price) {
      return "카드 잔액이 부족합니다.";
    }

    // 결제 완료, 카드 잔액 차감
    cardBalance -= price;
    return {
      message: `${drinkName} 구매가 완료되었습니다. (카드결제 완료 / 사용: ${price} / 잔액: ${cardBalance})`,
    };
  } else {
    return "유효하지 않은 결제 방식입니다.";
  }
}

for (let i = 0; i < 10; i++) {
  console.log(`=========== Case ${i + 1} ===========`);
  let cashCustomer = {
    100: Math.floor(Math.random() * 8),
    500: Math.floor(Math.random() * 5),
    1000: Math.floor(Math.random() * 5),
    5000: Math.floor(Math.random() * 3),
    10000: Math.floor(Math.random() * 3),
  };

  let cashMachine = {
    100: Math.floor(Math.random() * 20),
    500: Math.floor(Math.random() * 20),
    1000: Math.floor(Math.random() * 10),
    5000: Math.floor(Math.random() * 5),
    10000: Math.floor(Math.random() * 5),
  };
  console.log();

  const cardBalance = Math.floor(Math.random() * 3000);
  console.log("cardBalance", cardBalance);

  const itemChosen = items[Math.floor(Math.random() * items.length)];
  console.log("itemChosen -", itemChosen, "가격", priceItems[itemChosen]);

  // 현금 결제 예시: 사용자가 콜라를 구매하고, 2장의 1000원, 1장의 500원을 투입한 경우
  const cashResult = purchaseDrink(
    itemChosen,
    "cash",
    null,
    cashCustomer,
    cashMachine
  );
  console.log(cashResult);

  // 카드 결제 예시: 사용자가 카드(card1)로 커피를 구매한 경우
  const cardResult = purchaseDrink(itemChosen, "card", cardBalance);
  console.log(cardResult);
  console.log("\n\n\n");
}
