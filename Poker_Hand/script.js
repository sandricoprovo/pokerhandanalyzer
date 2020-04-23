// Function inside IIFE that runs program.
(function () {
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1") // 52 Cards
    .then(response => {
      if (response.status === 200) { // checks if success or fail
        return response.json(); // converts to json
      }
    })
    .then(data => {
      return fetch(`https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=5`) // 5 Cards
    })
    .then(response => {
      if (response.status === 200) { // check status
        return response.json(); // return successfull response
      }
    })
    .then(data => {
      // Creates img for each img and sets them within the current-cards div. 
      for (let i = 0; i < data.cards.length; i++) {
        let imgNode = document.createElement("IMG");
        let imgElement = document.createTextNode("");
        imgNode.setAttribute("class", "held-card")
        imgNode.setAttribute("src", data.cards[i].image);
        imgNode.setAttribute("alt", `This card is the ${data.cards[i].value} of ${data.cards[i].suit}"`);
        imgNode.append(imgElement);
        document.getElementById("current-cards").appendChild(imgNode);
      }
      analyzePokerHand(data); // passes the data response to a function
    })
  // FUNCTION: This function takes in data from the draw 5 cards fetch call and sorts the incoming hand data into a code of values and code of suits. It then uses regexes to test the data and check which poker hand is currently being held. The results are written to the page. 
  function analyzePokerHand(data) {
    let currentHand = data.cards // saves current drawn hand card objects to variable
    let firstCardSuit = currentHand[0].suit[0]; // saves the first cards suit for FLUSH checks
    let handSuitCode = null; // Code for hand suits used un Flush Checks
    let handValueCode = []; // holds the hand value code 
    let currentHandValues = [];  // a non-joined array for us in high card
    let results = document.createElement("H1");
    let resultsText = "";

    // Regexs
    const FLUSH = new RegExp(`^([^${firstCardSuit}]*${firstCardSuit}){5}[^${firstCardSuit}]*$`);
    const STRAIGHT = /(2345A|23456|34567|45678|56789|106789|10789J|1089JQ|109JKQ|10AJKQ)/g;
    const FULL_HOUSE = /(2{3}|3{3}|3{3}|5{3}|6{3}|7{3}|8{3}|9{3}|([1][0]){3}|J{3}|Q{3}|K{3}|A{3})(2{2}|3{2}|2{2}|5{2}|6{2}|7{2}|8{2}|9{2}|([1][0]){2}|J{2}|Q{2}|K{2}|A{2})/g;
    const FOUR_OF_A_KIND = /2{4}|3{4}|4{4}|5{4}|6{4}|7{4}|8{4}|9{4}|([1][0]){4}|J{4}|Q{4}|K{4}|A{4}/g;
    const THREE_OF_A_KIND = /(2{3}|3{3}|4{3}|5{3}|6{3}|7{3}|8{3}|9{3}|([1][0]){3}|J{3}|Q{3}|K{3}|A{3})/g;
    const PAIRS_CHECK = /(2{2}|3{2}|4{2}|5{2}|6{2}|7{2}|8{2}|9{2}|([1][0]){2}|J{2}|Q{2}|K{2}|A{2})/g;

    // Foreach is used to convert the current hand into a string of numbers using ASCII for the letters
    currentHand.forEach(card => {
      if (isNaN(card.value[0])) {
        handValueCode.push(card.value[0]); // logs first letter of Value (A,K,J,Q) to end of array
        currentHandValues.push(card.value);
      }
      else {
        handValueCode.unshift(card.value); // logs numbers to front of array
        currentHandValues.unshift(card.value);
      }
    });
    handValueCode = handValueCode.sort().join(""); // returns a sorted hand
    handSuitCode = currentHand.map(card => card.suit[0]).join(""); // returns string of 5 letters
    // If statesment block that evaluates hands
    if (STRAIGHT.test(handValueCode)) {
      if (FLUSH.test(handSuitCode)) {
        if (/A/g.test(handValueCode) && /K/g.test(handValueCode)) { // High Straight + Flush = Royal Flush
          resultsText = document.createTextNode("This is a Royal Flush.");
        }
        else {
          resultsText = document.createTextNode("This is a Straight Flush."); // Flush + Straight = Straight Flush
        }
      }
      else if (!FLUSH.test(handSuitCode)) {
        if (/A/g.test(handValueCode) && /K/g.test(handValueCode)) { // High Straight
          resultsText = document.createTextNode("This is a High Straight.");
        }
        else if (/2/g.test(handValueCode) && /A/g.test(handValueCode)) { // Low Straight
          resultsText = document.createTextNode("This is a Low Straight.");
        }
        else {
          resultsText = document.createTextNode("This is a Straight.");
        }
      }
    }
    else if (FLUSH.test(handSuitCode)) {
      resultsText = document.createTextNode("This is a Flush."); // Regular Flush
    }
    else if (FOUR_OF_A_KIND.test(handValueCode)) { // Four of a Kind
      resultsText = document.createTextNode("This is a Four of a Kind.");
    }
    else if (FULL_HOUSE.test(handValueCode)) { // Full House
      resultsText = document.createTextNode("This is a Full House.");
    }
    else if (THREE_OF_A_KIND.test(handValueCode)) { // Three of a Kind
      resultsText = document.createTextNode("This is Three of a Kind.");
    }
    else if (PAIRS_CHECK.test(handValueCode)) {
      if (handValueCode.match(PAIRS_CHECK).length === 2) { // Two matches = Two Pairs
        resultsText = document.createTextNode("This is a Two Pair.");
      }
      if (handValueCode.match(PAIRS_CHECK).length === 1) { // One match = One Pair
        resultsText = document.createTextNode("This is a Single Pair.");
      }
    }
    else if (/A/g.test(handValueCode)) { // Ace High
      resultsText = document.createTextNode("This is an Ace High");
    }
    else { // Checks for the high card
      let currentCardIndex = 0;
      const CARD_LIST = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'JACK', 'QUEEN', 'KING', 'ACE'];
      // Searchs for the current hand value in the CARD LIST, and whichever card has the highest index is he highest card in the current hand. 
      currentHandValues.forEach(card => {
        if (CARD_LIST.indexOf(card) > currentCardIndex) {
          currentCardIndex = CARD_LIST.indexOf(card);
        }
      });
      // Filters the currentHand array for the object that matches the current high card
      let highCard = currentHand.filter(card => card.value === `${CARD_LIST[currentCardIndex]}`);

      resultsText = document.createTextNode(`The High Card is ${CARD_LIST[currentCardIndex]} of ${highCard[0].suit}`);
    }
    results.append(resultsText);
    document.getElementById("results").appendChild(results);
  };
})()