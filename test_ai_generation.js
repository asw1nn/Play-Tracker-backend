async function testGeneration() {
    try {
        console.log('Testing AI Workout Generation...');

        const response = await fetch('http://localhost:3001/api/workouts/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                energyLevel: 'high',
                targetMuscles: ['chest', 'triceps'],
                duration: 'long',
                goal: 'gaining'
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('✅ Success! Generated Workout:');
        console.log('Summary:', data.summary);
        console.log('Exercises:', data.exercises.length);
        data.exercises.forEach((ex, i) => {
            console.log(`${i + 1}. ${ex.name} (${ex.sets.length} sets x ${ex.sets[0].reps})`);
        });

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

testGeneration();
