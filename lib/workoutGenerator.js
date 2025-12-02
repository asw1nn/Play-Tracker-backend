/**
 * AI Workout Generator
 * Generates personalized workouts based on user inputs using a rule-based algorithm.
 */

// Exercise Database
// Categorized by primary muscle group with metadata
const EXERCISE_DB = {
    chest: [
        { name: 'Bench Press', type: 'compound', difficulty: 'medium' },
        { name: 'Push Ups', type: 'compound', difficulty: 'easy' },
        { name: 'Incline Dumbbell Press', type: 'compound', difficulty: 'medium' },
        { name: 'Dumbbell Flys', type: 'isolation', difficulty: 'medium' },
        { name: 'Cable Crossovers', type: 'isolation', difficulty: 'medium' },
        { name: 'Dips', type: 'compound', difficulty: 'hard' }
    ],
    back: [
        { name: 'Pull Ups', type: 'compound', difficulty: 'hard' },
        { name: 'Barbell Rows', type: 'compound', difficulty: 'medium' },
        { name: 'Lat Pulldowns', type: 'compound', difficulty: 'easy' },
        { name: 'Seated Cable Rows', type: 'compound', difficulty: 'medium' },
        { name: 'Face Pulls', type: 'isolation', difficulty: 'easy' },
        { name: 'Deadlifts', type: 'compound', difficulty: 'hard' }
    ],
    shoulders: [
        { name: 'Overhead Press', type: 'compound', difficulty: 'medium' },
        { name: 'Lateral Raises', type: 'isolation', difficulty: 'easy' },
        { name: 'Front Raises', type: 'isolation', difficulty: 'easy' },
        { name: 'Arnold Press', type: 'compound', difficulty: 'medium' },
        { name: 'Rear Delt Flys', type: 'isolation', difficulty: 'easy' }
    ],
    legs: [
        { name: 'Squats', type: 'compound', difficulty: 'hard' },
        { name: 'Leg Press', type: 'compound', difficulty: 'medium' },
        { name: 'Romanian Deadlifts', type: 'compound', difficulty: 'medium' },
        { name: 'Lunges', type: 'compound', difficulty: 'medium' },
        { name: 'Leg Extensions', type: 'isolation', difficulty: 'easy' },
        { name: 'Leg Curls', type: 'isolation', difficulty: 'easy' },
        { name: 'Calf Raises', type: 'isolation', difficulty: 'easy' }
    ],
    biceps: [
        { name: 'Barbell Curls', type: 'isolation', difficulty: 'medium' },
        { name: 'Hammer Curls', type: 'isolation', difficulty: 'easy' },
        { name: 'Preacher Curls', type: 'isolation', difficulty: 'medium' },
        { name: 'Concentration Curls', type: 'isolation', difficulty: 'easy' }
    ],
    triceps: [
        { name: 'Tricep Pushdowns', type: 'isolation', difficulty: 'easy' },
        { name: 'Skull Crushers', type: 'isolation', difficulty: 'medium' },
        { name: 'Overhead Extensions', type: 'isolation', difficulty: 'medium' },
        { name: 'Close Grip Bench Press', type: 'compound', difficulty: 'medium' }
    ],
    core: [
        { name: 'Plank', type: 'isolation', difficulty: 'medium' },
        { name: 'Crunches', type: 'isolation', difficulty: 'easy' },
        { name: 'Leg Raises', type: 'isolation', difficulty: 'medium' },
        { name: 'Russian Twists', type: 'isolation', difficulty: 'medium' },
        { name: 'Ab Wheel Rollouts', type: 'compound', difficulty: 'hard' }
    ]
};

/**
 * Generate a workout based on user inputs
 * @param {Object} params
 * @param {string} params.energyLevel - 'low', 'medium', 'high'
 * @param {string[]} params.targetMuscles - Array of muscle groups (e.g., ['chest', 'triceps'])
 * @param {string} params.duration - 'short' (30m), 'long' (60m+)
 * @param {string} params.goal - 'cutting', 'gaining', 'recomposition'
 * @returns {Object} Generated workout plan
 */
function generateWorkout({ energyLevel, targetMuscles, duration, goal }) {
    // 1. Determine parameters based on inputs

    // Volume (number of exercises)
    let exerciseCount;
    if (duration === 'short') {
        exerciseCount = energyLevel === 'low' ? 3 : 4;
    } else { // long
        exerciseCount = energyLevel === 'low' ? 5 : energyLevel === 'medium' ? 6 : 8;
    }

    // Sets and Reps based on Goal
    let setRepScheme;
    let restPeriod;

    switch (goal) {
        case 'gaining': // Hypertrophy/Strength
            setRepScheme = { sets: 4, reps: '8-12' };
            restPeriod = '90s';
            break;
        case 'cutting': // Endurance/Calorie Burn
            setRepScheme = { sets: 3, reps: '15-20' };
            restPeriod = '45s';
            break;
        case 'recomposition': // Mix
        default:
            setRepScheme = { sets: 3, reps: '10-15' };
            restPeriod = '60s';
            break;
    }

    // Adjust sets based on energy level
    if (energyLevel === 'low') {
        setRepScheme.sets = Math.max(2, setRepScheme.sets - 1);
    } else if (energyLevel === 'high') {
        setRepScheme.sets = Math.min(5, setRepScheme.sets + 1);
    }

    // 2. Select Exercises
    const selectedExercises = [];
    const muscles = targetMuscles.map(m => m.toLowerCase());

    // Calculate exercises per muscle group
    const exercisesPerMuscle = Math.ceil(exerciseCount / muscles.length);

    // Helper to get random items from array
    const getRandom = (arr, n) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    };

    muscles.forEach(muscle => {
        if (EXERCISE_DB[muscle]) {
            // Prioritize compound movements for main lifts
            const compounds = EXERCISE_DB[muscle].filter(e => e.type === 'compound');
            const isolations = EXERCISE_DB[muscle].filter(e => e.type === 'isolation');

            let countForThisMuscle = exercisesPerMuscle;

            // If we have too many exercises planned, trim the last muscle groups
            if (selectedExercises.length + countForThisMuscle > exerciseCount) {
                countForThisMuscle = exerciseCount - selectedExercises.length;
            }

            if (countForThisMuscle > 0) {
                // Always try to include at least one compound if available
                let selection = [];
                if (compounds.length > 0) {
                    selection.push(getRandom(compounds, 1)[0]);
                    countForThisMuscle--;
                }

                // Fill rest with mix
                if (countForThisMuscle > 0) {
                    const remaining = [...compounds, ...isolations].filter(e => !selection.includes(e));
                    selection = [...selection, ...getRandom(remaining, countForThisMuscle)];
                }

                selectedExercises.push(...selection.map(ex => ({
                    ...ex,
                    muscleGroup: muscle
                })));
            }
        }
    });

    // 3. Format Output
    const formattedExercises = selectedExercises.map((ex, index) => ({
        id: Date.now() + index, // Temporary ID
        name: ex.name,
        sets: Array.from({ length: setRepScheme.sets }, (_, i) => ({
            id: Date.now() + index * 100 + i, // Unique ID for each set
            weight: '',
            reps: setRepScheme.reps,
            completed: false
        })),
        target: ex.muscleGroup,
        rest: restPeriod,
        notes: `Focus on form. ${goal === 'cutting' ? 'Keep heart rate up.' : 'Control the eccentric.'}`
    }));

    // Calculate estimated duration
    // (Sets * (Avg Rep Time 30s + Rest)) + Setup Time
    const avgSetTimeSeconds = 30 + parseInt(restPeriod);
    const totalSeconds = formattedExercises.reduce((acc, ex) => acc + (ex.sets.length * avgSetTimeSeconds), 0);
    const estimatedDurationMin = Math.ceil(totalSeconds / 60) + 5; // +5 min warmup/setup

    return {
        exercises: formattedExercises,
        summary: {
            goal: goal.charAt(0).toUpperCase() + goal.slice(1),
            duration: `${estimatedDurationMin} mins`,
            intensity: energyLevel.charAt(0).toUpperCase() + energyLevel.slice(1),
            totalSets: formattedExercises.reduce((acc, ex) => acc + ex.sets.length, 0)
        }
    };
}

module.exports = { generateWorkout };
