import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SWAPI_BASE_URL = 'https://swapi.dev/api';

async function fetchAndStoreData() {
  try {
    const filmsResponse = await axios.get(`${SWAPI_BASE_URL}/films/`);
    const films = filmsResponse.data.results;

    for (const film of films) {
      const filmData = await prisma.film.create({
        data: {
          title: film.title,
          episode_id: film.episode_id,
          opening_crawl: film.opening_crawl,
          director: film.director,
          producer: film.producer,
          release_date: new Date(film.release_date),
          url: film.url,
        },
      });

      const characterIds: string[] = [];

      const planetIds: string[] = [];

      const starshipIds: string[] = [];

      for (const characterUrl of film.characters) {
        const characterResponse = await axios.get(characterUrl);
        const character = characterResponse.data;

        const characterData = await prisma.people.upsert({
          where: { url: character.url },
          update: {},
          create: {
            name: character.name,
            height: character.height,
            mass: character.mass,
            hair_color: character.hair_color,
            skin_color: character.skin_color,
            eye_color: character.eye_color,
            birth_year: character.birth_year,
            gender: character.gender,
            homeworldId: await fetchAndStorePlanet(character.homeworld),
            filmIds: [],
            starshipIds: [],
            url: character.url,
          },
        });

        characterIds.push(characterData.id);

        await prisma.people.update({
          where: { id: characterData.id },
          data: {
            filmIds: { push: filmData.id },
          },
        });
      }

      for (const planetUrl of film.planets) {
        const planetResponse = await axios.get(planetUrl);
        const planet = planetResponse.data;

        const planetData = await prisma.planet.upsert({
          where: { url: planet.url },
          update: {},
          create: {
            name: planet.name,
            rotation_period: planet.rotation_period,
            orbital_period: planet.orbital_period,
            diameter: planet.diameter,
            climate: planet.climate,
            gravity: planet.gravity,
            terrain: planet.terrain,
            surface_water: planet.surface_water,
            population: planet.population,
            filmIds: [],
            residentIds: [],
            url: planet.url,
          },
        });

        planetIds.push(planetData.id);

        await prisma.planet.update({
          where: { id: planetData.id },
          data: {
            filmIds: { push: filmData.id },
          },
        });

        for (const residentUrl of planet.residents) {
          const residentResponse = await axios.get(residentUrl);
          const resident = residentResponse.data;

          const residentData = await prisma.people.upsert({
            where: { url: resident.url },
            update: {},
            create: {
              name: resident.name,
              height: resident.height,
              mass: resident.mass,
              hair_color: resident.hair_color,
              skin_color: resident.skin_color,
              eye_color: resident.eye_color,
              birth_year: resident.birth_year,
              gender: resident.gender,
              homeworldId: planetData.id,
              filmIds: [],
              starshipIds: [],
              url: resident.url,
            },
          });

          await prisma.planet.update({
            where: { id: planetData.id },
            data: {
              residentIds: { push: residentData.id },
            },
          });

          await prisma.people.update({
            where: { id: residentData.id },
            data: {
              filmIds: { push: filmData.id },
            },
          });
        }
      }

      for (const starshipUrl of film.starships) {
        const starshipResponse = await axios.get(starshipUrl);
        const starship = starshipResponse.data;

        const starshipData = await prisma.starship.upsert({
          where: { url: starship.url },
          update: {},
          create: {
            name: starship.name,
            model: starship.model,
            manufacturer: starship.manufacturer,
            cost_in_credits: starship.cost_in_credits,
            length: starship.length,
            max_atmosphering_speed: starship.max_atmosphering_speed,
            crew: starship.crew,
            passengers: starship.passengers,
            cargo_capacity: starship.cargo_capacity,
            consumables: starship.consumables,
            hyperdrive_rating: starship.hyperdrive_rating,
            MGLT: starship.MGLT,
            starship_class: starship.starship_class,
            pilotIds: [],
            filmIds: [],
            url: starship.url,
          },
        });

        starshipIds.push(starshipData.id);

        await prisma.film.update({
          where: { id: filmData.id },
          data: {
            starshipIds: { push: starshipData.id },
          },
        });

        await prisma.starship.update({
          where: { id: starshipData.id },
          data: {
            filmIds: { push: filmData.id },
          },
        });

        for (const pilotUrl of starship.pilots) {
          const pilotResponse = await axios.get(pilotUrl);
          const pilot = pilotResponse.data;

          const pilotData = await prisma.people.upsert({
            where: { url: pilot.url },
            update: {},
            create: {
              name: pilot.name,
              height: pilot.height,
              mass: pilot.mass,
              hair_color: pilot.hair_color,
              skin_color: pilot.skin_color,
              eye_color: pilot.eye_color,
              birth_year: pilot.birth_year,
              gender: pilot.gender,
              homeworldId: await fetchAndStorePlanet(pilot.homeworld),
              filmIds: [],
              starshipIds: [],
              url: pilot.url,
            },
          });

          await prisma.starship.update({
            where: { id: starshipData.id },
            data: {
              pilotIds: { push: pilotData.id },
            },
          });

          await prisma.people.update({
            where: { id: pilotData.id },
            data: {
              starshipIds: { push: starshipData.id },
            },
          });
        }
      }

      await prisma.film.update({
        where: { id: filmData.id },
        data: {
          characterIds: { push: characterIds },
        },
      });

      await prisma.film.update({
        where: { id: filmData.id },
        data: {
          planetIds: { push: planetIds },
        },
      });

      await prisma.film.update({
        where: { id: filmData.id },
        data: {
          starshipIds: { push: starshipIds },
        },
      });
    }
  } catch (error) {
    console.error('Error in fetchAndStoreData:', error);
  }
}

async function fetchAndStorePlanet(planetUrl: string): Promise<string> {
  const planetResponse = await axios.get(planetUrl);
  const planet = planetResponse.data;

  const planetData = await prisma.planet.upsert({
    where: { url: planet.url },
    update: {},
    create: {
      name: planet.name,
      rotation_period: planet.rotation_period,
      orbital_period: planet.orbital_period,
      diameter: planet.diameter,
      climate: planet.climate,
      gravity: planet.gravity,
      terrain: planet.terrain,
      surface_water: planet.surface_water,
      population: planet.population,
      filmIds: [],
      residentIds: [],
      url: planet.url,
    },
  });

  return planetData.id;
}

async function main() {
  console.log('Fetching data from api...');
  await fetchAndStoreData();
  console.log('Data fetched and stored successfully');
}

main()
  .then(() => {
    console.log('Data fetching and storing completed.');
  })
  .catch((error) => {
    console.error('Error in main execution:', error);
  });