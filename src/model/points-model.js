import Observable from '../framework/observable.js';
//import {getRandomPoint} from '../mock/point.js';
import { UpdateType } from '../const.js';

//const PointCount = 4;

export default class PointsModel extends Observable {
  #pointsApiService = null;
  //#points = Array.from({length : PointCount}, getRandomPoint);
  #points = [];


  constructor({pointsApiService}){
    super();
    this.#pointsApiService = pointsApiService;
  }

  get points(){
    return this.#points;
  }

  async init(){
    try {
      const points = await this.#pointsApiService.points;
      this.#points = points.map(this.#adaptToClient);
    } catch(err){
      this.#points = [];
    }

    this._notify(UpdateType.INIT);
  }

  async updatePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatePoint = this.#adaptToClient(response);

      this.#points = [
        ...this.#points.slice(0, index),
        updatePoint,
        ...this.#points.slice(index + 1),
      ];

      this._notify(updateType, updatePoint);
    } catch(err) {
      throw new Error('Can\'t update task');
    }


  }

  addPoint(updateType, update) {
    this.#points = [
      update,
      ...this.#points,
    ];

    this._notify(updateType, update);
  }

  deletePoint(updateType, update) {
    const index = this.#points.findIndex((point) => point.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];

    this._notify(updateType);
  }

  #adaptToClient(point) {
    const adaptedPoint = {...point,
      basePrice: point['base_price'],
      dateFrom: point['date_from'] !== null ? new Date(point['date_from']) : point['date_from'], // На клиенте дата хранится как экземпляр Date
      dateTo: point['date_to'] !== null ? new Date(point['date_to']) : point['date_to'], // На клиенте дата хранится как экземпляр Date
      isFavorite: point['is_favorite'],

    };

    // Ненужные ключи мы удаляем
    delete adaptedPoint['base_price'];
    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['is_favorite'];


    return adaptedPoint;
  }

}
