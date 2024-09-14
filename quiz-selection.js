document.addEventListener("DOMContentLoaded", () => {
    const selectAllQuizCatagory = document.querySelectorAll(".select-all-quiz-topics-button");
    const quizTopics = document.querySelectorAll(".quiz-topic");
    const startQuizButton = document.getElementById("start-quiz");
    const returnHomeButton = document.getElementById("return-home");

    // select all button selection
    selectAllQuizCatagory.forEach((quizTopic) => {
        quizTopic.addEventListener("click", () => selectAllQuizTopics(quizTopic));
    });

    // quiz topic selection
    quizTopics.forEach((quizTopic) => quizTopic.addEventListener("click", () => toggleQuizSelection(quizTopic)));

    // start quiz selection
    startQuizButton.addEventListener("click", startQuiz);
    returnHomeButton.addEventListener("click", () => window.location.href = 'home-page.html');

    function startQuiz() {
        const getSelectedQuizIds = () => {
            const selectedQuizzes = document.querySelectorAll(".quiz-topic.selected");
            // return an array of selected quiz ids: ["quiz-1", "quiz-2", "quiz-3"]
            return Array.from(selectedQuizzes).map((quiz) => quiz.id);
        }

        const storeSelectedQuizIdsTemporarily = () => {
            // convert quizzes array to a string first using JSON.stringify, because sessionStorage stores strings only
            // setItem(key, value)
            // key: "selectedQuizzes"
            // value: JSON.stringify(["quiz-1", "quiz-2", "quiz-3"])
            // sessionStorage = { "selectedQuizzes": '["quiz-1", "quiz-2", "quiz-3"]' }
            sessionStorage.setItem('selectedQuizIDs', JSON.stringify(getSelectedQuizIds()));
        }

        const navigateToQuizPage = () => {
            // if no quizzes are selected, alert the user
            if (getSelectedQuizIds().length < 1) {
                alert("Please select at least one topic to start.");
                return;
            }
            window.location.href = 'pre-quiz.html';

        }
        // Store the selected quiz IDs and navigate to the quiz page
        storeSelectedQuizIdsTemporarily();
        navigateToQuizPage();
    }

    





    












    // selects quizzes to take or remove
    function toggleQuizSelection(quizTopic) {
        if (quizTopic.classList.contains("selected")) {
            quizTopic.classList.remove("selected");
        } else {
            quizTopic.classList.add("selected");
        }

        checkTopicsSelected();
    }

    // if all quizzes are selected, the "Select All" button is selected
    // if one of the quizzes is deselected, the "Select All" button is deselected
    function checkTopicsSelected() {
        selectAllQuizCatagory.forEach((button) => {
            const group = button.closest("section[id]");
            const quizTopics = group.querySelectorAll(".quiz-topic");

            // total number of topics in a group
            let numberOfTopics = quizTopics.length;

            // number of selected topics
            let numberOfSelectedTopics = 0;
            quizTopics.forEach((quizTopic) => {
                if (quizTopic.classList.contains("selected")) {
                    numberOfSelectedTopics++;
                }
            });

            if (numberOfSelectedTopics === numberOfTopics) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        });
    }

    // selects all quizzes in a group
    function selectAllQuizTopics(button) {
        const group = button.closest("section[id]");
        const quizTopics = group.querySelectorAll(".quiz-topic");

        if (!button.classList.contains("selected")) {
            quizTopics.forEach((quizTopic) => {
                quizTopic.classList.add("selected");
            });
            button.classList.add("selected");
            return;
        }

        if (button.classList.contains("selected")) {
            quizTopics.forEach((quizTopic) => {
                quizTopic.classList.remove("selected");
            });
            button.classList.remove("selected");
            return;
        }
    }
});