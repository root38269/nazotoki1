const div_tab_wrapper = document.getElementById("div_tab_wrapper");
const div_question_area = document.getElementById("div_question_area");
const div_message_area = document.getElementById("div_message_area");
const div_input_area = document.getElementById("div_input_area");
const div_tab_bar = document.getElementById("div_tab_bar");

div_input_area.addEventListener("click", /**@param {MouseEvent} event */function (event) {
  if (event.target.classList.contains("input_button")) {
    input_str(event.target.innerText);
  }
});
document.addEventListener("keydown", /**@param {KeyboardEvent} event */function (event) {
  switch (event.key) {
    case "0": case "1": case "2": case "3": case "4": 
    case "5": case "6": case "7": case "8": case "9":
      document.getElementById("div_btn_" + event.key).click();
      break;
    case "Enter": case "e":
      document.getElementById("div_btn_E").click();
      break;
    case "Backspace": case "Delete": case "c":
      document.getElementById("div_btn_C").click();
      break;
  }
});

div_tab_bar.addEventListener("click", /**@param {MouseEvent} event */function (event) {
  if (event.target.classList.contains("tab_tab") || event.target.classList.contains("tab_caption")){
    let new_tab_number = Number(event.target.id.slice(7));
    input_str("C");
    switch_tab(new_tab_number);
  }
})

const digits = 4;
/**@type {[HTMLDivElement]} */
const output_elems = [];
for (let i = 0; i < digits; i++) {
  output_elems.push(document.getElementById("div_output_" + (i+1)));
}





let current_tab_number = 1;


function switch_tab (new_tab_number) {
  div_tab_wrapper.classList.remove("display" + current_tab_number);
  div_tab_wrapper.classList.add("display" + new_tab_number);
  current_tab_number = new_tab_number;
}


/**
 * 数字を提出し、結果を得る
 * @param {Number} num
 * @returns {"ERROR"|"LOSE"|"WIN"|"DRAW"} 
 */
function enter_number (num) {
  let my_hand = new PokerHand(get_numbers(num));
  let question_hand = new PokerHand(get_numbers(current_question_number()));
  if (my_hand.evaluation === 0) return "ERROR";
  if (my_hand.evaluation < question_hand.evaluation) return "LOSE";
  if (my_hand.evaluation === question_hand.evaluation) return "DRAW";
  if (my_hand.evaluation > question_hand.evaluation) return "WIN";
}


let next_reset = false;
/**
 * 文字を入力する
 * @param {"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"C"|"E"} str 
 */
function input_str (str) {
  if (str === "" || str === null) return;
  if (!Number.isNaN(Number(str))) {
    if (next_reset) {
      for (let i = 0; i < digits - 1; i++) {
        output_elems[i].innerText = "";
      }
      output_elems[digits - 1].innerText = str;
      next_reset = false;
    }else if (output_elems[0].innerText !== "") {
      return;
    }else{
      if (output_elems[digits - 2].innerText === "" && output_elems[digits - 1].innerText === "0") {
        output_elems[digits - 1].innerText = str;
      }else{
        for (let i = 0; i < digits - 1; i++) {
          output_elems[i].innerText = output_elems[i + 1].innerText;
        }
        output_elems[digits - 1].innerText = str;
      }
    }
    div_message_area.innerText = "　";
  }else if (str === "C") {
    for (let i = 0; i < digits; i++) {
      output_elems[i].innerText = "";
    }
    next_reset = false;
    div_message_area.innerText = "　";
  }else if (str === "E") {
    if (output_elems[0].innerText === "") return;
    let my_num = "";
    for (let i = 0; i < digits; i++) {
      my_num = my_num + output_elems[i].innerText;
    }
    let result = enter_number(Number(my_num));
    div_message_area.innerText = result;
    write_log(my_num + ":" + result);
    next_reset = true;
  }
}



/**
 * ログを出力する
 * @param {String} str 
 * @param {Boolean} newline 
 */
function write_log (str, newline = true) {
  let my_log_body = current_log_body();
  if (newline) str = str + "\n";
  my_log_body.value = str + my_log_body.value;
}

/**
 * 現在のタブの log_body
 * @returns {HTMLTextAreaElement} 
 */
function current_log_body () {
  return document.getElementById("textarea_log_body" + current_tab_number);
}

function current_question_number () {
  return Number(div_question_area.innerText);
}




//=================================================================


/**
 * 素因数分解する
 * @param {Number} number 素因数分解する数 1 以上の整数
 * @returns {[Number]}    素因数の配列を返す 素因数は大きい順 
 */
function factorizationB (number) {
  let target = number / 2;
  if (number === 1) return [];
  if (Number.isInteger(target)) {
    let result = factorizationB(target);
    result.push(2);
    return result;
  }
  for (let i = 3; true; i += 2) {
    target = number / i;
    if (Number.isInteger(target)) {
      let result = factorizationB(target);
      result.push(i);
      return result;
    }
    if (target < i) {
      return [number];
    }
  }
}

/**
 * 素因数分解する
 * @param {Number} number 素因数分解する数
 * @returns {[Number]}    素因数の配列を返す 素因数は小さい順 
 */
function factorization (number) {
  if (Number.isInteger(number)) {
    if (number < 0) number = -number;
    if (number > 0) {
      let result = factorizationB(number);
      result.reverse();
      return result;
    }
  }
}


function get_numbers (number) {
  return factorization(number).join("").split("").map(elem => Number(elem)).sort();
}

// todo: 0 の扱い


/*
  
  five of a kind  9
  straight flush  8
  four of a kind  7
  full house      6
  flush           5
  straight        4
  three of a kind 3
  two pair        2
  one pair        1
  high card       0

*/

/*スートなし flush, straight flush はない ワイルドカード非対応 */
class PokerHand {
  #evaluation = 0; get evaluation () {return this.#evaluation;}
  #numbers = []; get numbers () {return this.#numbers.concat([]);}
  set numbers (numbers) {
    if (Array.isArray(numbers)) {
      numbers = numbers.flat().map(elem => Number(elem)).filter(elem => (Number.isInteger(elem) && 1 <= elem && elem <= 13));
      this.#numbers = numbers;
      this.#evaluate();
    }
  }
  constructor (numbers) {
    this.numbers = numbers; // setter を実行
  }
  
  /**
   * 評価を再計算する
   */
  #evaluate () {
    let numbers = this.#numbers;
    this.#evaluation = 0;
    if (numbers.length === 5) {
      let target_map = new Map();
      numbers.forEach(function (value) {
        if (value === 1) value = 14;
        if (target_map.has(value)) {
          target_map.set(value, target_map.get(value) + 1);
        }else{
          target_map.set(value, 1);
        }
      });
      let target_entries = Array.from(target_map.entries());
      target_entries.sort(function(a, b) {
        if (a[1] > b[1]) return -1;
        if (a[1] < b[1]) return 1;
        if (a[1] === b[1]) {
          if (a[0] > b[0]) return -1;
          if (a[0] < b[0]) return 1;
          if (a[0] === b[0]) return 0;
        }
      });
      if (target_map.size === 1) {
        // five of a kind
        this.#evaluation = 9 * (10**10);
        this.#evaluation += target_entries[0][0] * (10**8);
      }else if (target_map.size === 2) {
        // four of a kind, full house
        if (target_entries[0][1] === 4) {
          this.#evaluation = 7 * (10**10);
        }else if (target_entries[0][1] === 3) {
          this.#evaluation = 6 * (10**10);
        }
        this.#evaluation += target_entries[0][0] * (10**8);
        this.#evaluation += target_entries[1][0] * (10**6);
      }else if (target_map.size === 3) {
        // three of a kind, two pair
        if (target_entries[0][1] === 2) {
          // two pair
          this.#evaluation = 2 * (10**10);
        }else if (target_entries[0][1] === 3) {
          // three of a kind
          this.#evaluation = 3 * (10**10);
        }
        this.#evaluation += target_entries[0][0] * (10**8);
        this.#evaluation += target_entries[1][0] * (10**6);
        this.#evaluation += target_entries[2][0] * (10**4);
      }else if (target_map.size === 4) {
        // one pair
        this.#evaluation = 3 * (10**10);
        this.#evaluation += target_entries[0][0] * (10**8);
        this.#evaluation += target_entries[1][0] * (10**6);
        this.#evaluation += target_entries[2][0] * (10**4);
        this.#evaluation += target_entries[3][0] * (10**2);
      }else if (target_map.size === 5) {
        // straight, high card
        if (target_entries[0][0] === 14  && target_entries[1][0] === 5 && target_entries[2][0] === 4 && target_entries[3][0] === 3 && target_entries[4][0] === 2) {
          // straight (wheel) 
          this.#evaluation = 4 * (10**10) + 5 * (10**8);
        }else{
          for (let i = 0; i <= 5; i++) {
            if (i === 5) {
              // straight
              this.#evaluation = 4 * (10**10);
              this.#evaluation += target_entries[0][0] * (10**8);
              break;
            }
            if (target_entries[i][0] !== target_entries[0][0] - i) {
              break;
            }
          }
          if (this.#evaluation === 0) {
            // high card
            this.#evaluation += target_entries[0][0] * (10**8);
            this.#evaluation += target_entries[1][0] * (10**6);
            this.#evaluation += target_entries[2][0] * (10**4);
            this.#evaluation += target_entries[3][0] * (10**2);
            this.#evaluation += target_entries[4][0];
          }
        }
      }
    }
  }
  
  /**
   * 役を文字列で取得する
   * @param {"ja"|"en"} lang 
   * @returns {String}
   */
  asString (lang = "ja") {
    switch (Math.floor(this.#evaluation / (10**10))) {
      case 0:
        if (this.#evaluation === 0) {
          return "";
        }
        if (lang === "en") {
          return "high card";
        }else if (lang === "ja") {
          return "ハイカード";
        }
      case 1:
        if (lang === "en") {
          return "one pair";
        }else if (lang === "ja") {
          return "ワンペア";
        }
      case 2:
        if (lang === "en") {
          return "two pair";
        }else if (lang === "ja") {
          return "ツーペア";
        }
      case 3:
        if (lang === "en") {
          return "three of a kind";
        }else if (lang === "ja") {
          return "スリーカード";
        }
      case 4:
        if (lang === "en") {
          return "straight";
        }else if (lang === "ja") {
          return "ストレート";
        }
      case 5:
        if (lang === "en") {
          return "flush";
        }else if (lang === "ja") {
          return "フラッシュ";
        }
      case 6:
        if (lang === "en") {
          return "full house";
        }else if (lang === "ja") {
          return "フルハウス";
        }
      case 7:
        if (lang === "en") {
          return "four of a kind";
        }else if (lang === "ja") {
          return "フォーカード";
        }
      case 8:
        if (lang === "en") {
          return "straight flush";
        }else if (lang === "ja") {
          return "ストレートフラッシュ";
        }
      case 9:
        if (lang === "en") {
          return "five of a kind";
        }else if (lang === "ja") {
          return "ファイブカード";
        }
    }
  }
}