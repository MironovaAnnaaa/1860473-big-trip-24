import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {timeDate} from '../utils/point.js';
import {EventType } from '../const.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const createEventTypeBlockTemplate = () => `
    ${EventType.map((type) => `<div class="event__type-item">
                          <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
                          <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
                        </div>`).join('')}
`;

const createDestinationListBlockTemplate = (destination) => `
    ${destination.map((item) => `<option value="${item.name}"></option>`).join('')}
`;

const createPicturesBlockTemplate = (pictures) => `
    ${pictures.map((item) => `<img class="event__photo" src="${item.src}" alt="${item.description}">`).join('')}
`;

function offersList(allOffersType,offerInPoint){

  return allOffersType.map((item) =>`<div class="event__offer-selector">
                        <input class="event__offer-checkbox  visually-hidden" id="${item.id}" type="checkbox" name="event-offer-${item.id}" ${offerInPoint.includes(item.id) ? 'checked=""' : ''}>
                        <label class="event__offer-label" for="${item.id}">
                          <span class="event__offer-title">${item.title}</span>
                          +€&nbsp;
                          <span class="event__offer-price">${item.price}</span>
                        </label>
                      </div>`).join('');
}

function createEditPointTemplate(point, isNewPoint, destinationTypes) {

  const {basePrice, dateFrom, dateTo, type, offers, typesOffers, typeDestinations, isDisabled, isSaving, isDeleting} = point;

  const {destination} = destinationTypes;

  const dateFromItem = timeDate(dateFrom,'DD/MM/YY hh:mm');
  const dateToItem = timeDate(dateTo,'DD/MM/YY hh:mm');
  const deleteButton = isDeleting ? 'Deleting...' : 'Delete';

  return (
    `<li class="trip-events__item"><form class="event event--edit" action="#" method="post">
                <header class="event__header">
                  <div class="event__type-wrapper">
                    <label class="event__type  event__type-btn" for="event-type-toggle-1">
                      <span class="visually-hidden">Choose event type</span>
                      <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
                    </label>
                    <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

                    <div class="event__type-list">
                      <fieldset class="event__type-group">
                        <legend class="visually-hidden">Event type</legend>

                        ${createEventTypeBlockTemplate()}
                      </fieldset>
                    </div>
                  </div>

                  <div class="event__field-group  event__field-group--destination">
                    <label class="event__label  event__type-output" for="event-destination-1">
                      ${type}
                    </label>

                       <input required class="event__input event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${typeDestinations ? typeDestinations.name : ''}" list="destination-list-1">
                    <datalist id="destination-list-1">
                      ${createDestinationListBlockTemplate(destination)}
                    </datalist>


                  </div>

                  <div class="event__field-group  event__field-group--time">
                    <label class="visually-hidden" for="event-start-time-1">From</label>
                    <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFromItem}">
                    —
                    <label class="visually-hidden" for="event-end-time-1">To</label>
                    <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateToItem}">
                  </div>

                  <div class="event__field-group  event__field-group--price">
                    <label class="event__label" for="event-price-1">
                      <span class="visually-hidden">Price</span>
                      €
                    </label>
                    <input class="event__input  event__input--price" id="event-price-1" required  type="number" min="1" max="100000" name="event-price" value="${basePrice}">
                  </div>

                  <button class="event__save-btn  btn  btn--blue" ${isDisabled ? 'disabled' : ''} type="submit">${isSaving ? 'Saving...' : 'Save'}</button>
                  <button class="event__reset-btn" type="reset" ${isDisabled ? 'disabled' : ''} >${isNewPoint ? 'Cancel' : deleteButton }</button>
                </header>
                <section class="event__details">
                ${offersList(typesOffers.offers,offers).length > 0 ? `
                  <section class="event__section  event__section--offers">
                    <h3 class="event__section-title  event__section-title--offers">Offers</h3>

                    <div class="event__available-offers">
                      ${offersList(typesOffers.offers,offers)}
                    </div>
                  </section>` : ''}
                  ${typeDestinations ? `
                  ${(typeDestinations.description || (typeDestinations.pictures.length > 0)) ? `
                    <section class="event__section  event__section--destination">
                    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
                    <p class="event__destination-description">${typeDestinations.description}</p>

                    <div class="event__photos-container">
                      <div class="event__photos-tape">
                        ${createPicturesBlockTemplate(typeDestinations.pictures)}
                      </div>
                    </div>
                  </section>` : ''}` : ''}

                </section>
              </form></li>`);
}

export default class PointForm extends AbstractStatefulView {
  #allOffers = null;
  #destinations = null;
  #handleFormSubmit = null;
  #handleCancelClick = null;
  #handleDeleteClick = null;
  #allOffersTypes = null;
  #destinationsTypes = null;
  #datePickerStart = null;
  #datePickerEnd = null;
  #isNewPoint = null;

  constructor({point, allOffers, destinations, isNewPoint, onFormSubmit, onCancelClick, onDeleteClick}){
    super();
    this.#allOffersTypes = allOffers;
    this.#isNewPoint = isNewPoint;
    this.#allOffers = this.#allOffersTypes.getOfferByType(point.type);
    this.#destinationsTypes = destinations;
    this.#destinations = this.#destinationsTypes.getDestinationById(point.destination);
    this._setState(PointForm.parsePointToState(point, this.#allOffers, this.#destinations));

    this.#handleFormSubmit = onFormSubmit;
    this.#handleCancelClick = onCancelClick;
    this.#handleDeleteClick = onDeleteClick;
    this._restoreHandlers();
  }

  get template() {
    return createEditPointTemplate(this._state, this.#isNewPoint, this.#destinationsTypes);
  }

  removeElement() {
    super.removeElement();

    if (this.#datePickerStart) {
      this.#datePickerStart.destroy();
      this.#datePickerStart = null;
    }

    if (this.#datePickerEnd) {
      this.#datePickerEnd.destroy();
      this.#datePickerEnd = null;
    }
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit',this.#formSubmitHandler);
    this.element.querySelector('#event-destination-1').addEventListener('change',this.#destinationChangeHandler);
    this.element.querySelector('.event__type-list').addEventListener('click',this.#offerChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('change',this.#priceChangeHandler);
    if (this.element.querySelector('.event__available-offers')) {
      this.element.querySelector('.event__available-offers').addEventListener('click',this.#offerItemChangeHandler);
    }
    if (this.#isNewPoint){
      this.element.querySelector('.event__reset-btn').addEventListener('click',this.#cancelClickHandler);
    } else {
      this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteClickHandler);
    }

    this.#setDatePickerStart();
    this.#setDatePickerEnd();
  }

  #cancelClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleCancelClick();
  };

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(PointForm.parseStateToPoint(this._state));
  };

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    this.#handleFormSubmit(PointForm.parseStateToPoint(this._state));
  };

  #destinationChangeHandler = (evt) => {
    evt.preventDefault();
    const destination = evt.target.value;
    if (this.#destinationsTypes.getDestinationByName(destination)){
      this.updateElement({
        destination : this.#destinationsTypes.getDestinationByName(destination).id,
        typeDestinations : {...this.#destinationsTypes.getDestinationByName(destination)},
      });
    } else {
      evt.target.value = '';
    }

  };

  #offerChangeHandler = (evt) => {
    evt.preventDefault();
    const offer = evt.target.previousElementSibling.value;
    this.updateElement({
      type: offer,
      typesOffers : {...this.#allOffersTypes.getOfferByType(offer)},
    });
  };

  #priceChangeHandler = (evt) => {
    evt.preventDefault();
    const newPrice = evt.target.value;
    this.updateElement({
      basePrice: newPrice,
    });
  };


  #offerItemChangeHandler = (evt) => {
    evt.preventDefault();
    const offerElement = evt.target.closest('.event__offer-selector');
    if (offerElement){
      if (offerElement.querySelector('.event__offer-checkbox:checked')){
        offerElement.querySelector('.event__offer-checkbox').checked = false;
      } else {
        offerElement.querySelector('.event__offer-checkbox').checked = true;
      }
      const offersChecked = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'));

      const offersCheckedId = offersChecked.map((offers) => (offers.id));
      this.updateElement({
        offers : offersCheckedId,
      });
    }

  };


  #setDatePickerStart(){
    this.#datePickerStart = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        dateFormat:'d/m/y H:i',
        enableTime : true,
        'time_24hr' : true,
        defaultDate: this._state.dateFrom,
        maxDate : this._state.dateTo,
        onChange: this.#dateStartChangeHandler,
      }
    );
  }


  #setDatePickerEnd(){
    this.#datePickerEnd = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        dateFormat:'d/m/y H:i',
        defaultDate: this._state.dateTo,
        enableTime : true,
        'time_24hr' : true,
        minDate : this._state.dateFrom,
        onChange: this.#dateEndChangeHandler,
      }
    );
  }

  #dateStartChangeHandler = ([dateFrom]) => {
    this._setState({dateFrom});
    this.#datePickerEnd.set('minDate', this._state.dateFrom);
  };

  #dateEndChangeHandler = ([dateTo]) => {
    this._setState({dateTo});
    this.#datePickerStart.set('maxDate', this._state.dateTo);
  };

  static parsePointToState(point,typesOffers,typeDestinations) {
    return {...point,
      typesOffers,
      typeDestinations,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
    };
  }

  static parseStateToPoint(state,typesOffers,typeDestinations) {
    delete state.isDisabled;
    delete state.isSaving;
    delete state.isDeleting;

    return {...state,typesOffers,typeDestinations};

  }

}
