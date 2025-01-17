import { Request, Response } from 'express';
import {
  getAllFilms,
  getFilmById,
  getUniqueFilterValues,
} from '../services/filmService';

export async function getFilms(req: Request, res: Response) {
  const { offset = 0, limit = 10 } = req.query;
  const { director, producer } = req.query;

  try {
    const filters: Record<string, string | { contains: string }> = {};
    if (director) {
      filters.director = director as string;
    }
    if (producer) {
      filters.producer = { contains: (producer as string).split(',')[0] };
    }

    const { results, count } = await getAllFilms(
      Number(offset),
      Number(limit),
      filters
    );

    res.status(200).json({ results, count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching films' });
  }
}

export async function getFilmByIdHandler(req: Request, res: Response) {
  const film = await getFilmById(req.params.id);

  if ('error' in film && film.error) {
    res.status(404).json({ message: film.message });
  } else {
    res.status(200).json(film);
  }
}

export async function getFilterValues(req: Request, res: Response) {
  try {
    const filterValues = await getUniqueFilterValues();
    res.status(200).json(filterValues);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching filter values' });
  }
}
