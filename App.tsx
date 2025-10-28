import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Flashcard } from "./components/Flashcard";
import { parseCards } from "./data/cards";
import type { Card } from "./types";
import {
  BookOpenIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "./components/icons";

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [incorrectCardIds, setIncorrectCardIds] = useState<Set<number>>(
    new Set()
  );
  const [isReviewMode, setIsReviewMode] = useState<boolean>(false);
  const [deck, setDeck] = useState<number[]>([]);
  const [currentDeckIndex, setCurrentDeckIndex] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadedCards = parseCards();
    setCards(loadedCards);
    try {
      const storedIncorrectIds = localStorage.getItem(
        "gKenteiIncorrectCardIds"
      );
      if (storedIncorrectIds) {
        setIncorrectCardIds(new Set(JSON.parse(storedIncorrectIds)));
      }
    } catch (error) {
      console.error("Failed to load incorrect cards from localStorage", error);
      setIncorrectCardIds(new Set());
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady) {
      localStorage.setItem(
        "gKenteiIncorrectCardIds",
        JSON.stringify(Array.from(incorrectCardIds))
      );
    }
  }, [incorrectCardIds, isReady]);

  const shuffleArray = useCallback(<T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }, []);

  useEffect(() => {
    if (cards.length === 0) return;

    let newDeck: number[];
    if (isReviewMode) {
      newDeck = Array.from(incorrectCardIds);
    } else {
      newDeck = cards.map((card) => card.id);
    }
    setDeck(shuffleArray(newDeck));
    setCurrentDeckIndex(0);
  }, [isReviewMode, cards, incorrectCardIds, shuffleArray]);

  const handleNext = useCallback(() => {
    setCurrentDeckIndex((prev) => prev + 1);
  }, []);

  const handleCorrect = useCallback(
    (cardId: number) => {
      if (isReviewMode) {
        setIncorrectCardIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
      }
      handleNext();
    },
    [isReviewMode, handleNext]
  );

  const handleIncorrect = useCallback(
    (cardId: number) => {
      setIncorrectCardIds((prev) => new Set(prev).add(cardId));
      handleNext();
    },
    [handleNext]
  );

  const handleToggleReviewMode = () => {
    if (!isReviewMode && incorrectCardIds.size === 0) {
      alert("間違えた問題はありません。素晴らしい！");
      return;
    }
    setIsReviewMode((prev) => !prev);
  };

  const currentCardId = deck[currentDeckIndex];
  const currentCard = useMemo(
    () => cards.find((card) => card.id === currentCardId),
    [cards, currentCardId]
  );

  const renderContent = () => {
    if (deck.length === 0) {
      if (isReviewMode) {
        return (
          <div className="message-card">
            <CheckCircleIcon className="icon-green" />
            <h2>復習完了!</h2>
            <p>間違えた問題は全てクリアしました。お疲れ様でした!</p>
          </div>
        );
      }
      return <div className="loading-text">Loading cards...</div>;
    }

    if (currentDeckIndex >= deck.length) {
      return (
        <div className="message-card">
          <SparklesIcon className="icon-yellow" />
          <h2>デッキ完了!</h2>
          <p>全てのカード学習お疲れ様でした!</p>
          <button
            onClick={() => setCurrentDeckIndex(0)}
            className="retry-button"
          >
            もう一度
          </button>
        </div>
      );
    }

    if (currentCard) {
      return (
        <Flashcard
          key={currentCard.id}
          card={currentCard}
          onCorrect={handleCorrect}
          onIncorrect={handleIncorrect}
        />
      );
    }

    return null;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <BookOpenIcon />
            G検定単語帳
          </h1>
          <div className="toggle-wrapper">
            <label htmlFor="review-toggle" className="toggle-label">
              <span
                className={`toggle-text ${
                  isReviewMode ? "active" : "inactive"
                }`}
              >
                復習モード ({incorrectCardIds.size})
              </span>
              <div className="toggle-container">
                <input
                  id="review-toggle"
                  type="checkbox"
                  className="toggle-input"
                  checked={isReviewMode}
                  onChange={handleToggleReviewMode}
                />
                <div className="toggle-bg"></div>
                <div className="toggle-dot"></div>
              </div>
            </label>
          </div>
        </div>
      </header>

      <main className="app-main">{renderContent()}</main>

      <footer className="app-footer">
        {deck.length > 0 && currentDeckIndex < deck.length && (
          <div className="progress-text">
            {currentDeckIndex + 1} / {deck.length}
          </div>
        )}
      </footer>
    </div>
  );
};

export default App;
