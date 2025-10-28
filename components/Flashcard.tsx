import React, { useState, useEffect, useMemo } from "react";
import type { Card } from "../types";
import { CheckIcon, XIcon } from "./icons";

interface FlashcardProps {
  card: Card;
  onCorrect: (cardId: number) => void;
  onIncorrect: (cardId: number) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  card,
  onCorrect,
  onIncorrect,
}) => {
  const [revealedAnswer, setRevealedAnswer] = useState<string>("");
  const [isFullyRevealed, setIsFullyRevealed] = useState<boolean>(false);

  useEffect(() => {
    setRevealedAnswer("");
    setIsFullyRevealed(false);
  }, [card]);

  const revealOneChar = () => {
    if (revealedAnswer.length < card.answer.length) {
      const nextReveal = card.answer.substring(0, revealedAnswer.length + 1);
      setRevealedAnswer(nextReveal);
      if (nextReveal.length === card.answer.length) {
        setIsFullyRevealed(true);
      }
    }
  };

  const flipCard = () => {
    setRevealedAnswer(card.answer);
    setIsFullyRevealed(true);
  };

  const answerDisplay = useMemo(() => {
    if (isFullyRevealed) {
      return card.answer;
    }
    return (
      revealedAnswer + "＿".repeat(card.answer.length - revealedAnswer.length)
    );
  }, [revealedAnswer, card.answer, isFullyRevealed]);

  const canRevealMore = revealedAnswer.length < card.answer.length;

  return (
    <div className="flashcard">
      <div className="flashcard-question">
        <h2>{card.question}</h2>
      </div>

      <div className="flashcard-answer">
        <p>{answerDisplay}</p>
      </div>

      <div className="flashcard-actions">
        {!isFullyRevealed ? (
          <div className="button-group">
            <button
              onClick={revealOneChar}
              disabled={!canRevealMore}
              className="btn btn-reveal"
            >
              1文字めくる
            </button>
            <button onClick={flipCard} className="btn btn-flip">
              めくる
            </button>
          </div>
        ) : (
          <div className="button-group animate-fade-in">
            <button
              onClick={() => onIncorrect(card.id)}
              className="btn btn-incorrect"
            >
              <XIcon />
              間違えた
            </button>
            <button
              onClick={() => onCorrect(card.id)}
              className="btn btn-correct"
            >
              <CheckIcon />
              正解した
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
