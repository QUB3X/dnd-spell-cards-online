import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Swipe from 'react-easy-swipe';

var cards;

// Doesnt work
// window.addEventListener("beforeunload", () => {
//     Deck.saveToLocalStorage(cards);
// })

const updateSpellSlots = (id, spellSlots) => {
    // It just works
    cards[id][1].spellSlots = spellSlots;
}

class Deck extends Component {
    constructor(props) {
        super(props);
        if(props.spells.length !== 0) {
            cards = props.spells;
            this.saveToLocalStorage(cards);
        } else {
            cards = this.retrieveFromLocalStorage();
        }
        this.state = {
            currentCardId: 0,
            deltaX: 0,
            isSwiping: false,
            isAnimating: false
        };
        this.minDeltaX = 20;
    }

    onSwipeStart = (e) => {
        this.setState({isSwiping: true, isAnimating: false, deltaX: 0});
    }

    onSwipeMove = (pos, e) => {
        if(pos.x < -this.minDeltaX || pos.x > this.minDeltaX) {
            this.setState({deltaX: pos.x});
        }
    }

    onSwipeEnd = (e) => {
        if(this.state.deltaX > this.minDeltaX) {
            this.prevCard();
        } else if(this.state.deltaX < -this.minDeltaX) {
            this.nextCard();
        }
    }

    // Next and prev card buttons
    prevCard = () => {
        this.setState({
            currentCardId: (cards.length + this.state.currentCardId-1) % cards.length,
            isSwiping:false,
            deltaX: 0
        });
    }

    nextCard = () => {
        this.setState({
            currentCardId: (cards.length + this.state.currentCardId+1) % cards.length,
            isSwiping:false,
            deltaX: 0
        });
    }

    // Save cards offline / keep last cards from last session
    saveToLocalStorage = (data) => {
        // check if localStorage is supported
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem("deck", JSON.stringify(data))
            console.log("Deck saved to localStorage!")
        } else {
            console.log("localStorage not supported!")
        }
    }

    retrieveFromLocalStorage = () => {
        // check if localStorage is supported
        if (typeof(Storage) !== "undefined") {
            try {
                const data = localStorage.getItem("deck");
                console.log("Deck retrieved from localStorage");
                return JSON.parse(data);
            } catch (err) {
                console.log("Couldnt retrieve localStorage! ERR: " + err );
                return null;
            }
        }
    }

    render() {
        const listItems = !cards ? null : cards.map((card, index) => (
            <Card cardData={card}
                key={index}
                cardId={index}
                currentCardId={this.state.currentCardId}
                deltaX={this.state.deltaX}
                isSwiping={this.state.isSwiping} />
        ));

    return (
        <div className="Deck Anim-fade-in">
            <nav className="Navbar">
                <Link className="Btn" to="/picker">Back</Link>
                <div className="Spacer"></div>
                <div className="Btn-group">
                    <a
                        className="Btn"
                        onClick={this.prevCard}>
                        Previous
                    </a>
                    <a
                        className="Btn"
                        onClick={this.nextCard}>
                        Next
                    </a>
                </div>
            </nav>
            <Swipe className="Deck-wrapper"
                onSwipeStart={this.onSwipeStart}
                onSwipeMove={this.onSwipeMove}
                onSwipeEnd={this.onSwipeEnd}
                allowMouseEvents={true}>
                <ul className="Deck-list">{listItems}</ul>
            </Swipe>
        </div>
    )
  }
}

const Card = (props) => {
    const data = props.cardData[1];
    const id = props.cardId;
    const ccid = props.currentCardId;
    const deltaX = props.deltaX;
    const isSwiping = props.isSwiping;

    const styles = {
        transformOrigin: "50% 100%"
    };
    var classes = "Card Anim-fade-in ";

    if(isSwiping) {
        classes = "Card";
    }

    if(isSwiping) {
        styles.transform = "translateX(" + deltaX + "px)" +
        "rotateZ(" + deltaX/3.14 + "deg)";
        styles.opacity = 1 - Math.abs(deltaX/100);
    }

    if(id === ccid) {
        // Render Card
        return (
            <li className={classes} style={styles}>
                <h3 className="Card-title">{data.title}</h3>
                <span className="Card-subtitle">{data.contents[0]}</span>
                <div className="Card-details">
                  <CardDetail cardText={data.contents[2]} className="Card-detail Card-castingTime" />
                  <CardDetail cardText={data.contents[3]} className="Card-detail Card-range" />
                  <CardDetail cardText={data.contents[4]} className="Card-detail Card-dudistancen" />
                  <CardDetail cardText={data.contents[5]} className="Card-detail Card-components" />
                </div>
                <div className="Card-description">
                  <CardText cardText={data.contents[7]} />
                  <CardText cardText={data.contents[8]} />
                  <CardText cardText={data.contents[9]} />
                  <CardText cardText={data.contents[10]} />
                </div>
                <SpellSlots cardId={id} slots={data.spellSlots || [3,6]} activeSlots={4} />
            </li>
        );
    } else {
        return null;
    }
}
// TODO: Add persistence between swipes
// Try data.<newProperty> in Parent Component
class SpellSlots extends Component {
  constructor(props) {
    super(props);
    this.id = props.cardId;
    this.state = {
      slots: props.slots[1],
      activeSlots: props.slots[0],
    }
  }

    addGem = () => {
            if (this.state.activeSlots < this.state.slots) {
                updateSpellSlots(this.id, [this.state.activeSlots+1,this.state.slots]);
                this.setState({activeSlots: this.state.activeSlots + 1});
            }
    }
    
    removeGem = () => {
        if (this.state.activeSlots > 0) {
            updateSpellSlots(this.id, [this.state.activeSlots-1,this.state.slots]);
            this.setState({activeSlots: this.state.activeSlots - 1});
        }
    }
  render() {
    // Create n-activeSlots gems
    var gems = [];
    for(let i = 0; i < this.state.slots; i++) {
      if(i < this.state.activeSlots) {
        gems.push(<span key={i} className="Gem Anim-fade-in"></span>);
      } else {
        gems.push(<span key={i} className="Gem-empty Anim-fade-in"></span>);
      }
    }
    return(
      <div className="Spellslots">
        <button className="Spellslots-btn-remove" onClick={this.removeGem}>–</button>
        <div className="Spellslots-gems">
            {(this.state.activeSlots <= 5) && gems}
            {(this.state.activeSlots > 5) && <span className="Gem-big Anim-fade-in">{this.state.activeSlots}</span>}
        </div>
        <button className="Spellslots-btn-add" onClick={this.addGem}>+</button>
      </div>
    )
  }
}

const CardText = (props) => {
    const text = props.cardText;
    if(text === "fill" || text === "" || text === undefined) {
        return null;
    } else {
        return <div className="Card-text">{text}</div>;
    }
}

const CardDetail = (props) => {
    const text = props.cardText.split(" | ");
    const title = text[0];
    const value = text[1];
    return (
        <div className={props.className}>
            {title}
            <span>
                {value}
            </span>
        </div>
    );
}

export default Deck;
