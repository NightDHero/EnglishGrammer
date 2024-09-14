import { questionBank } from "./questionBank.js";

document.addEventListener("DOMContentLoaded", () => {

    function getSelectedQuizIDs() {
        const quizIDs = sessionStorage.getItem("selectedQuizIDs");
        return quizIDs ? JSON.parse(quizIDs) : [];
    }
    
    function makeQuizIDsReadable(quizIDs) {
        return quizIDs.map(quizName => 
            quizName.split("-")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")
        );
    }

    function makeQuizIDsCamelCase(quizIDs) {
        return quizIDs.map(quizName => 
            quizName.split("-")
                    .map((word, index) => index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join("")
        );
    }

    function showSelectedQuizzes(quizIDs) {
        const selectedTopicsList = document.getElementById("selected-topics-list");
        const readableQuizIDs = makeQuizIDsReadable(quizIDs);

        readableQuizIDs.forEach(quizID => {
            const li = document.createElement("li");
            li.textContent = quizID;
            selectedTopicsList.appendChild(li);
        });
    }


    function showQuestionQuantityBorderWhenSelected() {
        document.getElementById("start-quiz-button").disabled = true;
        const questionQuantityOptionButtons = document.querySelectorAll(".question-quantity-option");
        questionQuantityOptionButtons.forEach(button => {
            button.addEventListener("click", () => {
                if (button.classList.contains("question-quantity-selection")) {
                    button.classList.remove("question-quantity-selection");
                    document.getElementById("start-quiz-button").disabled = true;
                } else {
                    questionQuantityOptionButtons.forEach(button => button.classList.remove("question-quantity-selection"));
                    button.classList.add("question-quantity-selection");
                    document.getElementById("start-quiz-button").disabled = false;
                }
            });
        });
    }



    function getSelectedQuestionQuantity() {
        const questionQuantityOptionButtons = document.querySelectorAll(".question-quantity-option");

        let questionQuantity = 0;
        questionQuantityOptionButtons.forEach(button => {
            if (button.classList.contains("question-quantity-selection")) {
                questionQuantity = button.dataset.quantity;
                sessionStorage.setItem("questionQuantity", questionQuantity);
            }
        });
        return questionQuantity;
    }

    function startQuizCheckup() {
        if (!getSelectedQuestionQuantity()) {
            alert("Please select the number of questions you would like to answer per topic.");
            return false;
        }

        if (sessionStorage.getItem("selectedQuizIDs") === null) {
            alert("Please select at least one topic to start.");
            window.location.href = "quiz-selection.html";
            return false;
        }

        return true;
    }

    
    function prepareQuizEnvironment() {
        document.getElementById("starting-container").style.display = "none";

        const startQuizButton = document.getElementById("start-quiz-button");
        const submitQuizButton = getOrCreateElement("submit-quiz-button", "submit-button", "button", document.body, "Submit Quiz");
        replaceElement(submitQuizButton, startQuizButton, "Submit Quiz");
        submitQuizButton.style.display = "none";

        selectOption();
    }

    function getQuestionBankQuestion(cammelCasedQuizIDs, questionQuantity) {
        const bank = questionBank();
    

        if (arguments.length === 1 && Array.isArray(cammelCasedQuizIDs)) {
            let selectedQuestions = {};
            cammelCasedQuizIDs.forEach(quizID => {
                if (bank[quizID]) {
                    selectedQuestions[quizID] = bank[quizID];
                } else {
                    console.error(`Quiz ID: ${quizID} not found in question bank`);
                }
            });
            return selectedQuestions;
        }
    

        if (arguments.length === 2 && Array.isArray(cammelCasedQuizIDs) && typeof questionQuantity === 'number') {
            let selectedQuestions = {};
            cammelCasedQuizIDs.forEach(quizID => {
                if (bank[quizID]) {
                    if (bank[quizID].length >= questionQuantity) {
                        selectedQuestions[quizID] = bank[quizID].slice(0, questionQuantity);
                    } else {
                        console.error(`Not enough questions available for quiz ID: ${quizID}`);
                    }
                } else {
                    console.error(`Quiz ID: ${quizID} not found in question bank`);
                }
            });
            return selectedQuestions;
        }
    
        console.error('Invalid arguments provided to getQuestionsFromQuestionBank');
        return {};
    }
    
    function getQuestionsFromQuestionBank(cammelCasedQuizIDs, questionQuantity) {

        if (arguments.length === 1 && Array.isArray(cammelCasedQuizIDs)) {
            let selectedQuestions = {};
            cammelCasedQuizIDs.forEach(quizID => {
                if (questionBank[quizID]) {
                    selectedQuestions[quizID] = questionBank[quizID];
                } else {
                    console.error(`Quiz ID: ${quizID} not found in question bank`);
                }
            });
            return selectedQuestions;
        }
    

        cammelCasedQuizIDs = cammelCasedQuizIDs || makeQuizIDsCamelCase(getSelectedQuizIDs());
        questionQuantity = questionQuantity || getSelectedQuestionQuantity();
    
        let allQuestions = {};
        for (let i = 0; i < cammelCasedQuizIDs.length; i++) {
            let quizID = cammelCasedQuizIDs[i];
            if (!allQuestions[quizID]) {
                allQuestions[quizID] = [];
            }
            const questions = questionBank()[quizID];
            if (!questions || questions.length < questionQuantity) {
                console.error(`Not enough questions available for quiz ID: ${quizID}`);
                continue;
            }
    

            questions.forEach((question, index) => {
                question.originalIndex = index;
                question.quizID = quizID; 
            });
    

            const shuffledQuestions = shuffleArray(questions);
    
            for (let j = 0; j < questionQuantity; j++) {
                const question = shuffledQuestions[j];
                question.id = `${quizID}-question-${question.originalIndex + 1}`; 
                allQuestions[quizID].push(question);
            }
        }
        sessionStorage.setItem("questions", JSON.stringify(allQuestions));
        return allQuestions;
    }

    function getOrCreateElement(elementID = null, elementClass = null, elementType = "div", parentElement = document.body, innerText = null) {
        let element = document.getElementById(elementID);

        if (!(parentElement instanceof HTMLElement)) {
            throw new Error('parentElement must be a valid DOM element');
        }

        if (!element) {
            element = document.createElement(elementType);
            element.id = elementID;
            element.className = elementClass;
            element.innerText = innerText;
            parentElement.appendChild(element);
        }
        return element;
    }


    function buildQuizQuestionElements() {
        const cammelCasedQuizIDs = makeQuizIDsCamelCase(getSelectedQuizIDs());
        const questionQuantity = getSelectedQuestionQuantity();
        let wholeQuestionContainer = getOrCreateElement("whole-question-container");
    

        let allQuestions = getQuestionsFromQuestionBank(cammelCasedQuizIDs, questionQuantity);
        let questionContainers = [];
        let questionNumberElement = getOrCreateElement("question-number", "question-number", "p", header);
    
        let flattenedQuestions = [];
        cammelCasedQuizIDs.forEach(quizID => {
            allQuestions[quizID].forEach((question) => {
                flattenedQuestions.push(question);
            });
        });
    
        flattenedQuestions = shuffleArray(flattenedQuestions);
        flattenedQuestions.forEach((question, index) => {

            let questionContainer = getOrCreateElement(`${question.quizID}-question-${question.originalIndex + 1}`, "question-container", "div", wholeQuestionContainer);
            let questionText = getOrCreateElement(`${question.quizID}-question-${question.originalIndex + 1}-text`, "question-text", "p", questionContainer, question.question);
    

            question.options = shuffleArray(question.options);
    
            question.options.forEach((option, optionIndex) => {
                let optionText = getOrCreateElement(`${question.quizID}-question-${question.originalIndex + 1}-option-${optionIndex}`, "question-option", "button", questionContainer, option);
            });
    
            let nextAndPreviousContainer = getOrCreateElement(`${question.quizID}-question-${question.originalIndex + 1}-button-container`, "next-previous-button-container", "div", questionContainer);
            let previousButton = getOrCreateElement(`${question.quizID}-question-${question.originalIndex + 1}-previous`, "previous-button", "button", nextAndPreviousContainer, "Previous");
            let hint = getOrCreateElement(`${question.quizID}-question-${question.originalIndex + 1}-hint`, "hint", "button", nextAndPreviousContainer, "?");
            let nextButton = getOrCreateElement(`${question.quizID}-question-${question.originalIndex + 1}-next`, "next-button", "button", nextAndPreviousContainer, "Next");
    
            questionContainers.push(questionContainer);
        });
    }
    

    

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    

    function headersInQuiz() {
        const questions = document.querySelectorAll(".question-container");
        const questionHeaders = document.querySelectorAll(".quiz-header");

        
        questionHeaders.forEach(header => {
            header.style.display = "none";
        });

        questions.forEach((question, index) => {
            question.style.display = (index === 0) ? "flex" : "none";
            

        });
    }

    function checkIfAllQuestionsAnswered() {
        const questions = document.querySelectorAll(".question-container");
        const answeredQuestions = Array.from(questions).filter(question => question.querySelector("input[type='radio']:checked"));
        return answeredQuestions.length === questions.length;
    }

    function selectOption() {
        const questions = document.querySelectorAll(".question-container");
        questions.forEach(question => {
            const options = question.querySelectorAll(".question-option");
            

            options.forEach(option => {
                option.addEventListener("click", (event) => {
                    const previousSelectedOption = question.querySelector(".selected-option");

                    if (previousSelectedOption) {
                        options.forEach(opt => opt.classList.remove("selected-option"));
                        answeredQuestions--;
                    }

                    if (!previousSelectedOption || previousSelectedOption !== option) {
                        option.classList.add("selected-option");
                        answeredQuestions++;
                    }

                    if (checkIfAllQuestionsAnswered()) {
                        document.getElementById("submit-quiz-button").style.display = "block";
                    } else {
                        document.getElementById("submit-quiz-button").style.display = "none";
                    }

                    const questionId = question.id;
                    const selectedAnswer = event.target.textContent;
    

                    storeSelectedAnswer(questionId, selectedAnswer);
    

                    // checkAnswerAndDisplayFeedback(questionId, selectedAnswer, question);
    
                });
            }); 
        });
    }

    let answeredQuestions = 0;
    function checkIfAllQuestionsAnswered() {
        const questions = document.querySelectorAll(".question-container");
        return answeredQuestions === questions.length;
    }


    function getSelectedOptions() {
        const selectedOptions = {};
        const questionContainers = document.querySelectorAll('.question-container');
    
        questionContainers.forEach(container => {
            const questionId = container.id; 
            const selectedOption = container.querySelector('.question-option.selected-option');
            if (selectedOption) {
                selectedOptions[questionId] = selectedOption.textContent;
            }
        });
    
        return selectedOptions;
    }

    
    function checkAnswerAndDisplayFeedback(questionId, selectedAnswer, questionContainer) {
        const questionsFromBank = JSON.parse(sessionStorage.getItem('questions'));
        const [quizID, , questionIndex] = questionId.split('-');
        const question = questionsFromBank[quizID].find(q => q.id === questionId);
        const correctAnswer = question.answer;
    
        const feedbackElement = getOrCreateElement(`${questionId}-feedback`, "feedback", "p", questionContainer);
    
        if (selectedAnswer === correctAnswer) {
            feedbackElement.textContent = "Correct!";
            feedbackElement.style.color = "green";
        } else {
            feedbackElement.textContent = `Incorrect! The correct answer is: ${correctAnswer}`;
            feedbackElement.style.color = "red";
        }
    }
    
    function storeSelectedAnswer(questionId, selectedAnswer) {
        let selectedAnswers = JSON.parse(sessionStorage.getItem('selectedAnswers')) || {};
        selectedAnswers[questionId] = selectedAnswer;
        sessionStorage.setItem('selectedAnswers', JSON.stringify(selectedAnswers));
        
    }


/*     function checkAnswerAndDisplayFeedback(questionId, selectedAnswer, questionContainer) {
        const questionsFromBank = JSON.parse(sessionStorage.getItem('questions'));
        const [quizID, , questionIndex] = questionId.split('-');
        const question = questionsFromBank[quizID].find(q => q.id === questionId);
        const correctAnswer = question.answer;
    
        const feedbackElement = getOrCreateElement(`${questionId}-feedback`, "feedback", "p", questionContainer);
    
        if (selectedAnswer === correctAnswer) {
            feedbackElement.textContent = "Correct!";
            feedbackElement.style.color = "green";
        } else {
            feedbackElement.textContent = `Incorrect! The correct answer is: ${correctAnswer}`;
            feedbackElement.style.color = "red";
        }
    } */



    function displayHintBriefly() {
        const questions = document.querySelectorAll(".question-container");
        questions.forEach(question => {
            const hintButton = question.querySelector(".hint");
            const questionID = question.id
            .split("-")[0]
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    
            hintButton.addEventListener("click", () => {
                const hint = makeQuizIDsReadable([questionID])[0];  
                hintButton.innerText = hint;
                console.log(hint);
                setTimeout(() => {
                    hintButton.innerText = "?";
                }, 2000);
            });
        });
    };

    function displayHintForeverAutomatically() {
        const questions = document.querySelectorAll(".question-container");
        questions.forEach(question => {
            const hintButton = question.querySelector(".hint");
            const questionID = question.id
            .split("-")[0]
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    
            const hint = makeQuizIDsReadable([questionID])[0]; 
            hintButton.innerText = hint;
            hintButton.style.pointerEvents = "none";
        });
    }

    function getQuestionByIndex(quizID, questionIndex) {
        const questionBank = getQuestionBankQuestion([quizID]);
        if (questionBank[quizID] && questionBank[quizID].length > questionIndex) {
            return questionBank[quizID][questionIndex];
        }
        console.error(`Not enough questions available for quiz ID: ${quizID}`);
        return null;
    }

    function displayQuizResults() {
        const selectedAnswers = JSON.parse(sessionStorage.getItem('selectedAnswers')) || {};

        sessionStorage.removeItem('selectedAnswers');

        const cammelCasedQuizIDs = makeQuizIDsCamelCase(getSelectedQuizIDs());
        const questionQuantity = getSelectedQuestionQuantity();
    

        let score = 0;
        let totalQuestions = 0;
        let correctAnswers = {};
        let incorrectAnswers = {};
    
        Object.entries(selectedAnswers).forEach(([questionId, selectedAnswer]) => {
            const [quizID, , questionIndex] = questionId.split('-');
            
            if (quizID && questionIndex) {
                const question = getQuestionByIndex(quizID, parseInt(questionIndex) - 1);
                if (question) {
                    const correctAnswer = question.answer;
                    if (selectedAnswer !== correctAnswer) {
                        incorrectAnswers[questionId] = selectedAnswer;
                    } else {
                        correctAnswers[questionId] = correctAnswer;
                    }
                    if (selectedAnswer === correctAnswer) {
                        score++;
                    }
                    totalQuestions++;
                }
            }
        });

        const header = document.getElementById("header");
        const quizResultsContainer = getOrCreateElement("quiz-results-container", "quiz-results-container", "div", document.body);
        const quizResults = getOrCreateElement("quiz-results", "quiz-results", "div", quizResultsContainer);
        const scoreElement = getOrCreateElement("score", "score", "p", quizResults);
        const questionNumberElement = document.querySelector(".question-number");
        replaceElement(scoreElement, questionNumberElement, `You scored ${score} out of ${totalQuestions}`);
        const retakeQuizButton = getOrCreateElement("retake-quiz-button", "retake-quiz-button", "button", header, "Retake Quiz");
    
        const submitQuizButton = document.getElementById("submit-quiz-button");
        submitQuizButton.style.display = "none";
        const quizContainers = document.querySelectorAll(".question-container");
        quizContainers.forEach(container => {
            container.style.display = "flex";
        });
    
        const selectedOptions = document.querySelectorAll(".selected-option");
        const options = document.querySelectorAll(".question-option");
        options.forEach(option => option.style.pointerEvents = "none");

        selectedOptions.forEach(option => {
            option.classList.remove("selected-option");
            option.style.pointerEvents = "none";
        
            const parentElementId = option.parentElement.id;
            let correctAnswerText = correctAnswers[parentElementId];
        
            console.log(`Parent Element ID: ${parentElementId}`);
            console.log(`Correct Answer Text: ${correctAnswerText}`);
        
            if (correctAnswerText === undefined) {

                const [quizID, , questionIndex] = parentElementId.split('-');
                if (quizID && questionIndex) {
                    const question = getQuestionByIndex(quizID, parseInt(questionIndex) - 1);  
                    if (question) {
                        correctAnswerText = question.answer;
                        correctAnswers[parentElementId] = correctAnswerText;
                        console.log(`Retrieved correct answer using quizID and questionIndex: ${correctAnswerText}`);
                    } else {
                        console.error(`Question not found for quizID: ${quizID}, questionIndex: ${questionIndex}`);
                        option.style.backgroundColor = "red";
                        option.parentElement.style.borderColor = "red";
                        return;
                    }
                } else {
                    console.error(`Invalid parentElementId format: ${parentElementId}`);
                    option.style.backgroundColor = "red";
                    option.parentElement.style.borderColor = "red";
                    return;
                }
            }

            
            if (option.innerText.trim() === correctAnswerText.trim()) {
                option.style.backgroundColor = "green";
                option.parentElement.style.borderColor = "green";
            } else {
                option.style.backgroundColor = "red";
                option.parentElement.style.borderColor = "red";
        
                const correctOption = Array.from(option.parentElement.children).find(child => {
                    console.log(`Checking child text: ${child.innerText.trim()}`);
                    return child.innerText.trim() === correctAnswerText.trim();
                });
        
                if (correctOption) {
                    console.log(`Correct option found for question ${parentElementId}, setting border to green and thickness to 2px`);
                    correctOption.style.borderColor = "green";
                    correctOption.style.borderStyle = "solid"; 
                    correctOption.style.borderWidth = "8px"; 
                }
            }
        });
    
        const nextButtons = document.querySelectorAll(".next-button");
        const previousButtons = document.querySelectorAll(".previous-button");
        nextButtons.forEach(button => button.style.display = "none");
        previousButtons.forEach(button => button.style.display = "none");
    
        const questionOptions = document.querySelectorAll(".question-option");
        questionOptions.forEach(option => option.classList.remove(".selected-option"));
    
        retakeQuizButton.addEventListener("click", () => {
            window.location.reload();
        });
    
        const quizSelectionButton = getOrCreateElement("quiz-selection-button", "quiz-selection-button", "button", header, "Select Another Quiz");
        quizSelectionButton.addEventListener("click", () => {
            window.location.href = "quiz-selection.html";
        });
    
        const homeButton = getOrCreateElement("home-button", "home-button", "button", header, "Home");
        homeButton.addEventListener("click", () => {
            window.location.href = "home-page.html";
        });
    
        stopStopwatch();
        displayHintForeverAutomatically();
    }






    function stopStopwatch() {
        clearInterval(timer);
    }

    let currentQuestionNumber = 0;
    function updateQuestionNumber() {
        const questionNumberElement = document.getElementById("question-number");
        const totalQuestionQuantity = getSelectedQuestionQuantity() * getSelectedQuizIDs().length;
        questionNumberElement.innerHTML = `<span class="fraction"><sup>${currentQuestionNumber + 1}</sup>―<sub>${totalQuestionQuantity}</sub></span>`;
    }

    
    function replaceElement(newElement, oldElement, innerText = "") {
        if (!(oldElement instanceof HTMLElement)) {
            throw new Error('oldElement must be a valid DOM element');
        }

        if (!oldElement) {
            throw new Error('oldElement must be a valid DOM element');
        }

        if (newElement) {
            newElement.innerText = innerText;
            oldElement.innerHTML = newElement.innerHTML;
            oldElement.parentNode.replaceChild(newElement, oldElement);
        }

        return newElement;
    }

    function setupQuestionNavigation() {
        const nextButtons = document.querySelectorAll(".next-button");
        const previousButton = document.querySelectorAll(".previous-button");
        checkIfFirstOrLastQuestion();

        nextButtons.forEach(nextButton => {
            nextButton.addEventListener("click", () => {
                showNextQuestion();
                checkIfFirstOrLastQuestion()
            });
        });

        previousButton.forEach(prevButton => {
            prevButton.addEventListener("click", () => {
                showPreviousQuestion();
                checkIfFirstOrLastQuestion()
            });
        });
    }

    let timer;
    function startStopwatch() {
        let time = 0;
        timer = setInterval(() => {
            time++;
            const hours = Math.floor(time / 3600);
            const minutes = Math.floor((time % 3600) / 60);
            const seconds = time % 60;
    
            const formattedTime = 
                String(hours).padStart(2, '0') + ':' + 
                String(minutes).padStart(2, '0') + ':' + 
                String(seconds).padStart(2, '0');
    
            document.getElementById("stopwatch").innerText = formattedTime;
        }, 1000);
    }




    



    function checkIfFirstOrLastQuestion() {
        const questions = document.querySelectorAll(".question-container");
        const lastQuestion = questions.length - 1;
        const currentQuestionIndex = Array.from(questions).indexOf(document.querySelector(".question-container:not([style*='display: none'])"));
        const previousButtons = document.querySelectorAll(".previous-button");
        const nextButtons = document.querySelectorAll(".next-button");
    
        previousButtons.forEach(button => {
            button.disabled = currentQuestionIndex === 0;
        });
    
        nextButtons.forEach(button => {
            button.disabled = currentQuestionIndex === lastQuestion;
        });
    }
    
    function showNextQuestion() {
        const currentQuestion = document.querySelector(".question-container:not([style*='display: none'])");
        const questions = Array.from(document.querySelectorAll('.question-container'));
        const currentQuestionIndex = questions.indexOf(currentQuestion);
        const nextQuestion = questions[currentQuestionIndex + 1];


        if (nextQuestion) {
            currentQuestion.style.display = "none";
            nextQuestion.style.display = "flex";
            currentQuestionNumber++;
            updateQuestionNumber();
        }

        
    }

    function showPreviousQuestion() {
        const currentQuestion = document.querySelector(".question-container:not([style*='display: none'])");
        const questions = Array.from(document.querySelectorAll('.question-container'));
        const currentQuestionIndex = questions.indexOf(currentQuestion);
        const previousQuestion = questions[currentQuestionIndex - 1];

        if (previousQuestion) {
            currentQuestion.style.display = "none";
            previousQuestion.style.display = "flex";
            currentQuestionNumber--;
            updateQuestionNumber();
        }
    }

    document.getElementById("start-quiz-button").addEventListener("click", () => {
        if (startQuizCheckup()) {
            prepareQuizEnvironment();
            buildQuizQuestionElements();
            headersInQuiz();
            setupQuestionNavigation();
            updateQuestionNumber();
            startStopwatch();
            selectOption();
            displayHintBriefly();

            document.getElementById("submit-quiz-button").addEventListener("click", () => {
                if (checkIfAllQuestionsAnswered()) {
                    displayQuizResults();
                }
            });


        }
        
    });

    

    showSelectedQuizzes(getSelectedQuizIDs());
    showQuestionQuantityBorderWhenSelected();

    


});